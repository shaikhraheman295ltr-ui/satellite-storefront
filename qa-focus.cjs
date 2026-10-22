const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

(async () => {
  const out = path.join(process.cwd(), "qa");
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });

  /* ---------------- mobile interactions ---------------- */
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const logs = [];
  page.on("console", (m) => logs.push({ type: m.type(), url: page.url(), text: m.text() }));
  page.on("pageerror", (e) => logs.push({ type: "pageerror", url: page.url(), text: e.message }));
  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));

  const shot = (name) => page.screenshot({ path: path.join(out, `${name}.png`) });
  const jump = async (y, wait = 700) => {
    await page.evaluate((yy) => {
      const l = window.__lenis;
      if (l) l.scrollTo(yy, { immediate: true });
      else window.scrollTo(0, yy);
    }, y);
    await page.waitForTimeout(wait);
  };

  // shop filters
  await page.goto("http://localhost:3000/shop", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const shopBefore = await page.evaluate(() => {
    const aside = document.querySelector("#shop-filters");
    return {
      asideVisible: !!aside && getComputedStyle(aside).display !== "none",
      cards: document.querySelectorAll('a[aria-label^="View "]').length,
    };
  });
  await page.getByRole("button", { name: /filters \+ sort/i }).click();
  await page.waitForTimeout(300);
  const shopOpen = await page.evaluate(() => {
    const aside = document.querySelector("#shop-filters");
    return {
      open: aside?.getAttribute("aria-hidden"),
      display: aside ? getComputedStyle(aside).display : null,
      expanded: document.querySelector('[aria-controls="shop-filters"]')?.getAttribute("aria-expanded"),
    };
  });
  await shot("m14-shop-filters");
  await page.getByRole("button", { name: /^HIKER/ }).click();
  await page.waitForTimeout(400);
  const shopFiltered = await page.evaluate(() => ({
    cards: [...document.querySelectorAll('a[aria-label^="View "]')].map((a) => a.getAttribute("aria-label")),
    count: document.body.textContent?.match(/(\d+) RESULTS/)?.[1],
    button: document.querySelector('[aria-controls="shop-filters"]')?.textContent?.replace(/\s+/g, " ").trim(),
  }));
  await shot("m15-shop-filtered");
  await page.getByRole("button", { name: /hide filters/i }).click();
  await page.waitForTimeout(300);
  const shopClosed = await page.evaluate(() => {
    const aside = document.querySelector("#shop-filters");
    return { display: aside ? getComputedStyle(aside).display : null };
  });

  // collection tap-to-play + shop link
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  const collectionTop = await page.evaluate(() => {
    const s = document.querySelector('section[aria-labelledby="collection-title"]');
    return s ? s.getBoundingClientRect().top + scrollY : 0;
  });
  await jump(collectionTop + 320, 3500);
  const frameSel = 'section[aria-labelledby="collection-title"] [data-frame]';
  const before = await page.getAttribute(frameSel, "data-frame");
  const box = await page.locator(frameSel).boundingBox();
  if (box) {
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  }
  await page.waitForTimeout(900);
  const after = await page.getAttribute(frameSel, "data-frame");
  const shopVisible = await page.evaluate(() => {
    const link = [...document.querySelectorAll('a')].find((a) => a.textContent?.includes("SHOP →"));
    if (!link) return { exists: false };
    const r = link.getBoundingClientRect();
    const el = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { exists: true, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, topEl: el?.tagName, topText: el?.textContent?.trim().slice(0, 30) };
  });
  await shot("m16-collection-loaded");

  // details panel + newsletter
  const detailsTop = await page.evaluate(() => {
    const s = document.querySelector('section[aria-labelledby="details-title"]');
    return s ? s.getBoundingClientRect().top + scrollY : 0;
  });
  await jump(detailsTop + 2600, 1000);
  await shot("m17-details-panel");
  const newsTop = await page.evaluate(() => {
    const s = document.querySelector('section[aria-labelledby="newsletter-title"]');
    return s ? s.getBoundingClientRect().top + scrollY : 0;
  });
  await jump(newsTop - 80, 800);
  await shot("m18-newsletter");

  // collection shop navigation
  await jump(collectionTop + 320, 700);
  await page.getByRole("link", { name: /shop →/i }).click();
  await page.waitForTimeout(1000);
  const collectionNav = page.url();

  /* ---------------- reduced motion ---------------- */
  const rctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const rp = await rctx.newPage();
  await rp.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await rp.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await rp.waitForTimeout(1400);
  const reduced = await rp.evaluate(() => ({
    auto: document.querySelector('[aria-label*="utoplay"], button[aria-pressed]')?.textContent?.trim(),
    autoPressed: document.querySelector('[aria-label*="utoplay"], button[aria-pressed]')?.getAttribute("aria-pressed"),
    frame: document.querySelector("[data-frame]")?.getAttribute("data-frame"),
    cursorNone: document.documentElement.classList.contains("cursor-none-desktop"),
    marquee: (() => {
      const el = document.querySelector(".marquee-track");
      return el ? getComputedStyle(el).animationName : null;
    })(),
  }));
  await rp.evaluate(() => window.scrollTo(0, 1200));
  await rp.waitForTimeout(500);
  const reducedScrolled = await rp.evaluate(() => ({
    frame: document.querySelector("[data-frame]")?.getAttribute("data-frame"),
    scrollY: window.scrollY,
  }));
  await rp.screenshot({ path: path.join(out, "m19-reduced.png") });

  // desktop search list (no black filler)
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const dp = await dctx.newPage();
  await dp.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await dp.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await dp.waitForTimeout(1200);
  await dp.getByRole("button", { name: /open search/i }).click();
  await dp.waitForTimeout(300);
  await dp.keyboard.type("orbit");
  await dp.waitForTimeout(700);
  await dp.screenshot({ path: path.join(out, "p10-search-fixed.png") });

  const errors = logs.filter((l) => l.type === "error" || l.type === "pageerror");
  const result = {
    shopBefore,
    shopOpen,
    shopFiltered,
    shopClosed,
    collection: { before, after, shopVisible, urlAfterClick: collectionNav },
    reduced,
    reducedScrolled,
    errors,
  };
  fs.writeFileSync(path.join(out, "focus.json"), JSON.stringify(result, null, 2));
  await browser.close();
  console.log(JSON.stringify(result, null, 2));
})();
