/* Broad QA pass against the production build on localhost:3000.
   Run with: node qa-audit.cjs
*/
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const BASE = "http://localhost:3000";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const out = path.join(process.cwd(), "qa");
fs.mkdirSync(out, { recursive: true });

const routes = [
  "/",
  "/shop",
  "/shop?c=RUNNER",
  "/product/orbit-runner-01",
  "/checkout",
  "/about",
  "/contact",
  "/does-not-exist",
];

async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    ...opts,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  return { ctx, page };
}

async function routePass(page, route) {
  const consoleErrors = [];
  const pageErrors = [];
  const failed = [];
  const onConsole = (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  };
  const onPageError = (e) => pageErrors.push(e.message);
  const onFailed = (r) => failed.push(`${r.url()} :: ${r.failure()?.errorText}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onFailed);
  let status = 0;
  let err;
  try {
    const res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 });
    status = res?.status() ?? 0;
    await page.waitForTimeout(800);
  } catch (e) {
    err = e.message;
  }
  const meta = await page.evaluate(() => ({
    title: document.title,
    h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.replace(/\s+/g, " ").trim()),
    videos: document.querySelectorAll("video").length,
    canvases: [...document.querySelectorAll("canvas")].map((c) => ({
      w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight,
    })),
    brokenImgs: [...document.images]
      .filter((i) => !i.complete || i.naturalWidth === 0)
      .map((i) => i.currentSrc || i.src)
      .slice(0, 10),
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    bodyScrollWidth: document.body.scrollWidth,
    header: (() => {
      const h = document.querySelector("header");
      if (!h) return null;
      return { scrollWidth: h.scrollWidth, clientWidth: h.clientWidth, rect: h.getBoundingClientRect().toJSON() };
    })(),
    h1Clip: [...document.querySelectorAll("h1")].map((h) => ({
      text: h.textContent.replace(/\s+/g, " ").trim(),
      scrollWidth: h.scrollWidth,
      clientWidth: h.clientWidth,
      overflow: h.scrollWidth > h.clientWidth + 2,
    })),
    emptyLinks: [...document.querySelectorAll('a[href="#"],a[href=""]')].map((a) => a.textContent.trim()),
  }));
  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("requestfailed", onFailed);
  return { route, status, err, consoleErrors, pageErrors, failed, ...meta };
}

async function collectLinks(page) {
  const links = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => h && h.startsWith("/") && !h.startsWith("//"))
  );
  return [...new Set(links)].sort();
}

async function checkLink(ctx, href) {
  try {
    const res = await ctx.request.get(BASE + href, { timeout: 15000 });
    return { href, status: res.status() };
  } catch (e) {
    return { href, status: "ERR", error: e.message };
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const results = { routes: [], links: [], viewports: [], forms: {}, quickAdd: {}, autoplay: {}, crossBrowser: {} };

  // ---------- route + console pass (desktop) ----------
  for (const route of routes) {
    const { ctx, page } = await newPage(browser);
    results.routes.push(await routePass(page, route));
    await ctx.close();
  }

  // ---------- internal link crawl ----------
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const hrefs = new Set(await collectLinks(page));
    for (const r of ["/shop", "/about", "/contact", "/product/orbit-runner-01", "/checkout"]) {
      await page.goto(BASE + r, { waitUntil: "networkidle" });
      for (const h of await collectLinks(page)) hrefs.add(h);
    }
    for (const h of hrefs) results.links.push(await checkLink(ctx, h));
    await ctx.close();
  }

  // ---------- responsive widths ----------
  for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
    const height = width < 768 ? 700 : 900;
    const mobile = width < 768;
    const { ctx, page } = await newPage(browser, {
      viewport: { width, height },
      isMobile: mobile,
      hasTouch: mobile,
      deviceScaleFactor: mobile ? 1.5 : 1,
    });
    for (const route of ["/", "/shop", "/about", "/contact", "/product/orbit-runner-01", "/checkout"]) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(350);
      const item = await page.evaluate(() => {
        const wide = [...document.querySelectorAll("body *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            if (!r.width || !r.height || s.position === "fixed" || s.visibility === "hidden") return false;
            if (r.right > innerWidth + 2 || r.left < -2) {
              if (el.closest(".marquee-track")) return false;
              return true;
            }
            return false;
          })
          .slice(0, 8)
          .map((el) => ({
            tag: el.tagName,
            cls: (el.className || "").toString().slice(0, 80),
            text: (el.textContent || "").trim().slice(0, 50),
            rect: (() => { const r = el.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) }; })(),
          }));
        const header = document.querySelector("header > div");
        const h1s = [...document.querySelectorAll("h1")].map((h) => ({
          text: h.textContent.replace(/\s+/g, " ").trim().slice(0, 50),
          sw: h.scrollWidth,
          cw: h.clientWidth,
          overflow: h.scrollWidth > h.clientWidth + 2,
        }));
        return {
          sw: document.documentElement.scrollWidth,
          vw: innerWidth,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          headerOverflow: header ? header.scrollWidth > header.clientWidth + 1 : false,
          headerSW: header?.scrollWidth,
          headerCW: header?.clientWidth,
          h1s,
          wide,
        };
      });
      results.viewports.push({ width, route, ...item });
      if ((width === 320 || width === 360) && (route === "/" || route === "/about")) {
        await page.screenshot({ path: path.join(out, `audit-${route.replace(/\W/g, "") || "home"}-${width}.png`), fullPage: false });
      }
    }
    await ctx.close();
  }
  await browser.close();

  // ---------- interactions on a fresh desktop context ----------
  const b2 = await chromium.launch({ executablePath: CHROME, headless: true });
  {
    const { ctx, page } = await newPage(b2);
    await page.goto(BASE + "/shop", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("sh-cart-v1"));
    await page.reload({ waitUntil: "networkidle" });
    const add = page.locator("article button", { hasText: "ADD +" }).first();
    await add.click();
    await page.waitForTimeout(600);
    const cartText = await page.locator('[role="dialog"][aria-label="Shopping cart"]').innerText();
    results.quickAdd = {
      clickedSizeChoice: false,
      cartText: cartText.slice(0, 600),
      pickedMiddleSize: /SIZE EU 43/.test(cartText),
      addedWithoutPicker: true,
      localStorage: await page.evaluate(() => localStorage.getItem("sh-cart-v1")),
    };

    // wishlist persistence + discoverability
    await page.keyboard.press("Escape");
    await page.goto(BASE + "/shop", { waitUntil: "networkidle" });
    const heart = page.locator('button[aria-label="Save to wishlist"]').first();
    await heart.click();
    await page.waitForTimeout(300);
    const wish = await page.evaluate(() => ({
      stored: JSON.parse(localStorage.getItem("sh-cart-v1") || "{}").wish,
      headerText: document.querySelector("header")?.innerText,
      wishlistLinks: [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => /wish|saved/i.test(h || "")),
      bodyMentionsWishlist: /wishlist|saved/i.test(document.body.innerText),
    }));
    results.wishlist = wish;
    await ctx.close();
  }

  // ---------- forms / checkout ----------
  {
    const { ctx, page } = await newPage(b2);
    // contact
    await page.goto(BASE + "/contact", { waitUntil: "networkidle" });
    await page.fill('input[placeholder="FULL NAME"]', "QA Tester");
    await page.fill('input[placeholder="YOU@DOMAIN.COM"]', "qa@example.com");
    await page.fill("textarea", "Checking the contact form.");
    await page.getByRole("button", { name: /send message/i }).click();
    await page.waitForTimeout(300);
    results.forms.contact = {
      success: await page.getByText(/MESSAGE \/ RECEIVED/i).isVisible().catch(() => false),
      activeElement: await page.evaluate(() => document.activeElement?.tagName + ":" + (document.activeElement?.textContent || "").trim().slice(0, 30)),
    };

    // newsletter
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.locator("#newsletter-email").fill("qa@example.com");
    await page.getByRole("button", { name: /subscribe/i }).click();
    await page.waitForTimeout(300);
    results.forms.newsletter = {
      success: await page.getByText(/SUBSCRIBED/i).first().isVisible().catch(() => false),
      activeElement: await page.evaluate(() => document.activeElement?.tagName + ":" + (document.activeElement?.textContent || "").trim().slice(0, 30)),
    };

    // checkout with seeded cart
    await page.evaluate(() => {
      localStorage.setItem("sh-cart-v1", JSON.stringify({
        items: [{ slug: "orbit-runner-01", name: "ORBIT RUNNER 01", price: 8990, size: 42, index: "01", image: "/images/1.webp", qty: 1 }],
        wish: [],
      }));
    });
    await page.goto(BASE + "/checkout", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const labels = page.locator("form label");
    const inputs = page.locator("form input");
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const el = inputs.nth(i);
      const type = await el.getAttribute("type");
      if (type === "radio") continue;
      await el.fill(type === "email" ? "qa@example.com" : type === "tel" ? "+919999999999" : type === "text" || !type ? "QA" : "400001");
    }
    await page.getByRole("button", { name: /pay securely/i }).click();
    await page.waitForTimeout(500);
    results.forms.checkout = {
      success: await page.getByText(/ORDER \/ CONFIRMED/i).isVisible().catch(() => false),
      cartAfterOrder: await page.evaluate(() => localStorage.getItem("sh-cart-v1")),
      summary: (await page.locator("body").innerText()).slice(0, 300),
    };
    await ctx.close();
  }

  // ---------- autoplay / frames ----------
  {
    const { ctx, page } = await newPage(b2);
    await page.addInitScript(() => localStorage.removeItem("sh-cart-v1"));
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const frame0 = await page.locator("[data-frame]").first().getAttribute("data-frame");
    await page.waitForTimeout(2000);
    const frame1 = await page.locator("[data-frame]").first().getAttribute("data-frame");
    const autoText = await page.evaluate(() => document.body.innerText.match(/AUTO:(ON|OFF)/)?.[0] || null);
    const canvasInfo = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      if (!c) return null;
      const ctx2 = c.getContext("2d");
      const d = ctx2.getImageData(0, 0, Math.min(20, c.width), Math.min(20, c.height)).data;
      let sum = 0; for (let i = 0; i < d.length; i += 4) sum += d[i] + d[i + 1] + d[i + 2];
      return { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight, sample: Math.round(sum / (d.length / 4) / 3) };
    });
    // collection is below; find its data-frame and check idle vs hover
    const sectionTops = await page.evaluate(() =>
      [...document.querySelectorAll("section")].map((s) => ({ label: s.getAttribute("aria-labelledby") || s.getAttribute("aria-label"), top: Math.round(s.getBoundingClientRect().top + scrollY) }))
    );
    const coll = sectionTops.find((s) => s.label === "collection-title");
    await page.evaluate((y) => {
      const l = window.__lenis; if (l) l.scrollTo(y, { immediate: true }); else scrollTo(0, y);
    }, coll.top + 80);
    await page.waitForTimeout(1600);
    const collFrameIdle = await page.locator('[aria-labelledby="collection-title"] [data-frame]').getAttribute("data-frame").catch(() => null);
    const collBox = await page.locator('[aria-labelledby="collection-title"] canvas').boundingBox();
    if (collBox) await page.mouse.move(collBox.x + collBox.width / 2, collBox.y + collBox.height / 2);
    await page.waitForTimeout(1200);
    const collFrameHover = await page.locator('[aria-labelledby="collection-title"] [data-frame]').getAttribute("data-frame").catch(() => null);
    results.autoplay = {
      frame0, frame1, autoText, canvasInfo, collectionIdleFrame: collFrameIdle, collectionHoverFrame: collFrameHover,
      collectionTouchedByAutoplay: collFrameIdle !== "1",
    };
    await ctx.close();
  }

  // reduced motion
  {
    const { ctx, page } = await newPage(b2, { reducedMotion: "reduce" });
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1400);
    results.autoplay.reduced = {
      frame: await page.locator("[data-frame]").first().getAttribute("data-frame"),
      autoText: await page.evaluate(() => document.body.innerText.match(/AUTO:(ON|OFF)/)?.[0] || null),
    };
    await ctx.close();
  }
  await b2.close();

  // ---------- Chrome vs Edge quick pass ----------
  for (const [name, exe] of [["chrome", CHROME], ["edge", EDGE]]) {
    const browser = await chromium.launch({ executablePath: exe, headless: true });
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1.5 });
    const page = await ctx.newPage();
    await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1600);
    const info = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      vw: innerWidth,
      frame: document.querySelector("[data-frame]")?.getAttribute("data-frame"),
      canvas: (() => { const c = document.querySelector("canvas"); return c ? { w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight } : null; })(),
    }));
    results.crossBrowser[name] = { errors, ...info };
    await ctx.close();
    await browser.close();
  }

  fs.writeFileSync(path.join(out, "audit.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
