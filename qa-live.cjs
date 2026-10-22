/**
 * Live production verification for the fixes made after the first audit.
 * Run: node qa-live.cjs
 * Output: qa/live.json
 */
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
const OUT = path.join(process.cwd(), "qa");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const result = { checks: {}, consoleErrors: [], badResponses: [] };

  const setup = async (context) => {
    const page = await context.newPage();
    page.on("console", (m) => {
      if (m.type() === "error") result.consoleErrors.push({ url: page.url(), text: m.text() });
    });
    page.on("pageerror", (e) => result.consoleErrors.push({ url: page.url(), text: e.message }));
    page.on("response", (r) => {
      if (r.status() >= 400 && !r.url().includes("does-not-exist")) {
        result.badResponses.push({ status: r.status(), url: r.url() });
      }
    });
    await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
    return page;
  };

  const jump = async (page, y, wait = 600) => {
    await page.evaluate((yy) => {
      const l = window.__lenis;
      if (l) l.scrollTo(yy, { immediate: true });
      else window.scrollTo(0, yy);
    }, y);
    await page.waitForTimeout(wait);
  };

  const topOf = async (page, selector) =>
    page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : null;
    }, selector);

  const frameOf = (page, selector) =>
    page.getAttribute(selector, "data-frame");

  /* ------------------------------------------------------------------ */
  /* Desktop                                                             */
  /* ------------------------------------------------------------------ */
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await setup(desktop);
  const pageErrors = result.consoleErrors;

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);

  // v1 hero: old play-to-hold behaviour only, never a continuous loop.
  const heroA = await frameOf(page, 'section[aria-label^="Hero"] [data-frame]');
  await page.waitForTimeout(1400);
  const heroB = await frameOf(page, 'section[aria-label^="Hero"] [data-frame]');
  result.checks.heroV1 = { a: heroA, b: heroB, stableAfterHold: heroA === heroB };

  // Craft: idle autoplay, scroll scrub, idle resume.
  const craftTop = await topOf(page, 'section[aria-label^="Craft"]');
  await jump(page, craftTop, 1800);
  const craftA = await frameOf(page, 'section[aria-label^="Craft"] [data-frame]');
  await page.waitForTimeout(1500);
  const craftB = await frameOf(page, 'section[aria-label^="Craft"] [data-frame]');
  await jump(page, craftTop + 1300, 500);
  const craftScrub = await frameOf(page, 'section[aria-label^="Craft"] [data-frame]');
  await page.waitForTimeout(1600);
  const craftResume = await frameOf(page, 'section[aria-label^="Craft"] [data-frame]');
  result.checks.craft = {
    top: craftTop,
    idleA: craftA,
    idleB: craftB,
    scrollFrame: craftScrub,
    resumeFrame: craftResume,
    autoplays: craftA !== craftB,
    scrubWorks: craftScrub !== craftB,
    resumes: craftResume !== craftScrub,
  };

  // Collection: auto-loop, hover pause, leave resumes.
  const collectionTop = await topOf(page, 'section[aria-labelledby="collection-title"]');
  await jump(page, collectionTop + 300, 1800);
  await page.mouse.move(8, 8);
  await page.waitForTimeout(300);
  const collFrame = 'section[aria-labelledby="collection-title"] [data-frame]';
  const collA = await frameOf(page, collFrame);
  await page.waitForTimeout(1300);
  const collB = await frameOf(page, collFrame);
  const box = await page.locator(collFrame).boundingBox();
  if (box) await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.waitForTimeout(500);
  const hoverA = await frameOf(page, collFrame);
  await page.waitForTimeout(1100);
  const hoverB = await frameOf(page, collFrame);
  await page.mouse.move(8, 8);
  await page.waitForTimeout(1400);
  const collResume = await frameOf(page, collFrame);
  result.checks.collection = {
    idleA: collA,
    idleB: collB,
    hoverA,
    hoverB,
    hoverPaused: hoverA === hoverB,
    resumeFrame: collResume,
    autoplays: collA !== collB,
    resumesAfterHover: collResume !== hoverB,
    box,
  };

  // CTA uses v1 tail: not a continuous auto-loop.
  const ctaTop = await topOf(page, 'section[aria-labelledby="cta-title"]');
  await jump(page, ctaTop, 3000);
  const ctaEl = 'section[aria-labelledby="cta-title"] [data-frame]';
  const ctaA = await frameOf(page, ctaEl);
  await page.waitForTimeout(1400);
  const ctaB = await frameOf(page, ctaEl);
  result.checks.ctaV1 = { a: ctaA, b: ctaB, stableAfterHold: ctaA === ctaB };

  // Crosshair + reveal + overflow at desktop.
  await page.mouse.move(600, 400);
  await page.waitForTimeout(200);
  result.checks.cursor = await page.evaluate(() => {
    const el = document.querySelector(".crosshair-cursor");
    const style = el ? getComputedStyle(el) : null;
    return {
      rootClass: document.documentElement.classList.contains("cursor-none-desktop"),
      exists: !!el,
      display: style?.display,
      opacity: style?.opacity,
      transform: style?.transform,
      dataHover: el?.getAttribute("data-hover"),
      bodyCursor: getComputedStyle(document.body).cursor,
    };
  });

  const reveals = await page.evaluate(() => {
    const els = [...document.querySelectorAll(".reveal")];
    return {
      count: els.length,
      visible: els.filter((e) => e.classList.contains("is-visible")).length,
      hiddenBelowFold: els.filter((e) => !e.classList.contains("is-visible")).length,
    };
  });
  result.checks.reveals = reveals;

  /* ------------------------------------------------------------------ */
  /* Shop size picker + checkout cart clear                              */
  /* ------------------------------------------------------------------ */
  await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const addBtn = page.getByRole("button", { name: /choose a size/i }).first();
  const cartBefore = await page.evaluate(() => JSON.parse(localStorage.getItem("sh-cart-v1") || "[]").length);
  await addBtn.click();
  await page.waitForTimeout(250);
  const picker = await page.evaluate(() => {
    const group = document.querySelector('[role="group"][aria-label^="Choose a size"]');
    return {
      open: !!group,
      expanded: document.activeElement?.getAttribute("aria-expanded") ?? null,
      cartCount: JSON.parse(localStorage.getItem("sh-cart-v1") || "[]").length,
    };
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  const afterEscape = await page.evaluate(() => ({
    group: !!document.querySelector('[role="group"][aria-label^="Choose a size"]'),
    cartCount: JSON.parse(localStorage.getItem("sh-cart-v1") || "[]").length,
  }));
  await addBtn.click();
  await page.waitForTimeout(250);
  const group = page.locator('[role="group"][aria-label^="Choose a size"]').first();
  await group.getByRole("button", { name: /Add EU 42 to cart/i }).click();
  await page.waitForTimeout(700);
  const afterSize = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem("sh-cart-v1") || "[]");
    return {
      count: data.length,
      size: data[0]?.size,
      dialogOpen: !!document.querySelector('[role="dialog"][aria-label="Shopping cart"]') &&
        !document.querySelector('[role="dialog"][aria-label="Shopping cart"]')?.closest("[inert]"),
    };
  });
  result.checks.sizePicker = { cartBefore, picker, afterEscape, afterSize };

  // Go to checkout through the drawer.
  const dialog = page.locator('[role="dialog"][aria-label="Shopping cart"]');
  await dialog.getByRole("link", { name: /checkout/i }).click();
  await page.waitForURL("**/checkout", { timeout: 8000 });
  await page.waitForTimeout(500);
  await page.getByLabel("EMAIL *").fill("qa@example.com");
  await page.getByLabel("PHONE *").fill("9999999999");
  await page.getByLabel("FIRST NAME *").fill("QA");
  await page.getByLabel("LAST NAME *").fill("Runner");
  await page.getByLabel("ADDRESS *").fill("1 Test Street");
  await page.getByLabel("CITY *").fill("Mumbai");
  await page.getByLabel("STATE *").fill("Maharashtra");
  await page.getByLabel("PIN *").fill("400001");
  await page.getByRole("button", { name: /pay securely/i }).click();
  await page.waitForTimeout(800);
  const checkout = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    return {
      heading: h1?.textContent?.replace(/\s+/g, " ").trim(),
      focused: document.activeElement === h1,
      activeTag: document.activeElement?.tagName,
      cart: JSON.parse(localStorage.getItem("sh-cart-v1") || "[]"),
      stored: localStorage.getItem("sh-cart-v1"),
    };
  });
  result.checks.checkoutClear = checkout;

  /* ------------------------------------------------------------------ */
  /* Contact + newsletter success focus                                  */
  /* ------------------------------------------------------------------ */
  await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.getByLabel("NAME *").fill("QA");
  await page.getByLabel("EMAIL *").fill("qa@example.com");
  await page.getByLabel("MESSAGE *").fill("Testing the contact confirmation focus.");
  await page.getByRole("button", { name: /send message/i }).click();
  await page.waitForTimeout(400);
  result.checks.contactFocus = await page.evaluate(() => ({
    focused: document.activeElement?.getAttribute("role"),
    text: document.activeElement?.textContent?.replace(/\s+/g, " ").trim().slice(0, 60),
  }));

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.getByLabel("Email address").fill("qa@example.com");
  await page.getByRole("button", { name: /subscribe/i }).click();
  await page.waitForTimeout(400);
  result.checks.newsletterFocus = await page.evaluate(() => ({
    focused: document.activeElement?.getAttribute("role"),
    text: document.activeElement?.textContent?.replace(/\s+/g, " ").trim().slice(0, 60),
  }));

  /* ------------------------------------------------------------------ */
  /* Viewport overflow: 320 / 360 / 768                                  */
  /* ------------------------------------------------------------------ */
  result.checks.overflows = {};
  for (const [w, h] of [[320, 800], [360, 800], [768, 900]]) {
    const c = await browser.newContext({ viewport: { width: w, height: h } });
    const p = await setup(c);
    for (const route of ["/", "/about", "/shop"]) {
      await p.goto(BASE + route, { waitUntil: "networkidle" });
      await p.waitForTimeout(600);
      const m = await p.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth,
        overflow: document.documentElement.scrollWidth - innerWidth,
        bodyScrollWidth: document.body.scrollWidth,
        h1Width: (() => {
          const h1 = document.querySelector("h1");
          if (!h1) return null;
          const r = h1.getBoundingClientRect();
          return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), scrollWidth: h1.scrollWidth, clientWidth: h1.clientWidth };
        })(),
      }));
      result.checks.overflows[`${w}${route}`] = m;
    }
    await c.close();
  }

  /* ------------------------------------------------------------------ */
  /* Mobile frame paths + autoplay                                       */
  /* ------------------------------------------------------------------ */
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const mp = await setup(mobile);
  const frameRequests = [];
  mp.on("request", (r) => {
    if (/\/frames\//.test(r.url())) frameRequests.push(r.url().replace(BASE, ""));
  });
  await mp.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await mp.waitForTimeout(2200);
  const mobileCraftTop = await topOf(mp, 'section[aria-label^="Craft"]');
  await jump(mp, mobileCraftTop, 1800);
  const mCraftA = await frameOf(mp, 'section[aria-label^="Craft"] [data-frame]');
  await mp.waitForTimeout(1500);
  const mCraftB = await frameOf(mp, 'section[aria-label^="Craft"] [data-frame]');
  const mCollTop = await topOf(mp, 'section[aria-labelledby="collection-title"]');
  await jump(mp, mCollTop + 250, 1800);
  const mCollA = await frameOf(mp, 'section[aria-labelledby="collection-title"] [data-frame]');
  await mp.waitForTimeout(1400);
  const mCollB = await frameOf(mp, 'section[aria-labelledby="collection-title"] [data-frame]');
  result.checks.mobile = {
    overflow: await mp.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    craft: { a: mCraftA, b: mCraftB, autoplays: mCraftA !== mCraftB },
    collection: { a: mCollA, b: mCollB, autoplays: mCollA !== mCollB },
    v1Requests: frameRequests.filter((u) => u.startsWith("/frames/v1/")),
    v1DesktopRequests: frameRequests.filter((u) => u.startsWith("/frames/v1/") && !u.startsWith("/frames/v1/m/")),
    nonV1Sample: frameRequests.filter((u) => /\/frames\/2\./.test(u)).slice(0, 4),
    mobileVariants: frameRequests.filter((u) => /\/m\//.test(u)).length,
  };
  await mobile.close();

  /* ------------------------------------------------------------------ */
  /* Reduced motion                                                      */
  /* ------------------------------------------------------------------ */
  const reducedCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const rp = await setup(reducedCtx);
  await rp.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await rp.waitForTimeout(1200);
  const rTop = await topOf(rp, 'section[aria-label^="Craft"]');
  await jump(rp, rTop, 1200);
  const rA = await frameOf(rp, 'section[aria-label^="Craft"] [data-frame]');
  await rp.waitForTimeout(1400);
  const rB = await frameOf(rp, 'section[aria-label^="Craft"] [data-frame]');
  result.checks.reducedMotion = await rp.evaluate(({ a, b }) => ({
    autoButton: document.querySelector('[aria-label*="utoplay"]')?.textContent?.trim(),
    autoPressed: document.querySelector('[aria-label*="utoplay"]')?.getAttribute("aria-pressed"),
    cursorClass: document.documentElement.classList.contains("cursor-none-desktop"),
    cursorVisible: (() => {
      const el = document.querySelector(".crosshair-cursor");
      return el ? getComputedStyle(el).display !== "none" && getComputedStyle(el).opacity !== "0" : false;
    })(),
    revealUnhidden: [...document.querySelectorAll(".reveal")].every((e) => e.classList.contains("is-visible")),
    craftAutoplay: a !== b,
  }), { a: rA, b: rB });
  await reducedCtx.close();

  await browser.close();
  result.consoleErrors = pageErrors;
  fs.writeFileSync(path.join(OUT, "live.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
