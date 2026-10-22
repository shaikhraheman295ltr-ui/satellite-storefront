const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

(async () => {
  const out = path.join(process.cwd(), "qa");
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const logs = [];
  const bad = [];
  page.on("console", (m) => logs.push({ type: m.type(), text: m.text() }));
  page.on("pageerror", (e) => logs.push({ type: "pageerror", text: e.message }));
  page.on("response", (r) => {
    if (r.status() >= 400) bad.push({ status: r.status(), url: r.url() });
  });
  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const home = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelectorAll("h1").length,
    heroFrame: document.querySelector("[data-frame]")?.getAttribute("data-frame"),
    overflow: document.documentElement.scrollWidth - innerWidth,
  }));

  await page.goto("http://localhost:3000/product/orbit-runner-01", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const pdp = await page.evaluate(() => ({
    jsonLd: !!document.querySelector('script[type="application/ld+json"]'),
    h1: document.querySelector("h1")?.textContent,
    title: document.title,
  }));

  await page.getByRole("button", { name: /^42$/ }).click();
  await page.getByRole("button", { name: /add to cart/i }).click();
  await page.waitForTimeout(500);
  const cartOpen = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Shopping cart"]');
    return !!d && !d.closest("[inert]");
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /open search/i }).click();
  await page.keyboard.type("orbit");
  await page.waitForTimeout(300);
  await page.keyboard.press("Enter");
  await page.waitForURL("**/product/**", { timeout: 8000 }).catch(() => {});
  const searchUrl = page.url();

  const mctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const mp = await mctx.newPage();
  await mp.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await mp.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await mp.waitForTimeout(1500);
  const mobileHome = await mp.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    scrollHint: !!document.querySelector("[data-frame] .md\\:block") , // not meaningful; kept for count
    height: document.body.scrollHeight,
  }));
  await mp.goto("http://localhost:3000/shop", { waitUntil: "networkidle" });
  await mp.waitForTimeout(500);
  const mobileShop = await mp.evaluate(() => {
    const aside = document.querySelector("#shop-filters");
    return {
      filtersDisplay: aside ? getComputedStyle(aside).display : null,
      filterButton: !!document.querySelector('[aria-controls="shop-filters"]'),
      cards: document.querySelectorAll('a[aria-label^="View "]').length,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });

  const errors = logs.filter((l) => l.type === "error" || l.type === "pageerror");
  const result = {
    home,
    pdp,
    cartOpen,
    searchUrl,
    mobileHome,
    mobileShop,
    errors,
    badResponses: bad.filter((b) => !/does-not-exist/.test(b.url).replace(/^\s+|\s+$/g, "")).slice(0, 20),
  };
  fs.writeFileSync(path.join(out, "prod.json"), JSON.stringify(result, null, 2));
  await browser.close();
  console.log(JSON.stringify(result, null, 2));
})();
