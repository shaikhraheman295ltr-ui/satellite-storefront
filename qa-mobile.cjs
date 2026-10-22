const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

(async () => {
  const out = path.join(process.cwd(), "qa");
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true,
  });
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

  const jump = async (y) => {
    await page.evaluate((yy) => {
      const l = window.__lenis;
      if (l) l.scrollTo(yy, { immediate: true });
      else window.scrollTo(0, yy);
    }, y);
    await page.waitForTimeout(800);
  };
  const shot = async (name) => {
    await page.screenshot({ path: path.join(out, `${name}.png`) });
  };

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  await shot("m01-hero");

  const meta = await page.evaluate(() => ({
    height: document.body.scrollHeight,
    vw: innerWidth,
    sw: document.documentElement.scrollWidth,
    sections: [...document.querySelectorAll("section")].map((s) => ({
      label: s.getAttribute("aria-label") || s.getAttribute("aria-labelledby"),
      top: Math.round(s.getBoundingClientRect().top + scrollY),
      h: Math.round(s.getBoundingClientRect().height),
    })),
    wide: [...document.querySelectorAll("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > innerWidth + 2 && r.height > 10;
      })
      .slice(0, 12)
      .map((el) => ({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 70), w: Math.round(el.getBoundingClientRect().width) })),
    nav: (() => {
      const h = document.querySelector("header");
      return h ? { h: Math.round(h.getBoundingClientRect().height) } : null;
    })(),
    hud: (() => {
      const el = document.querySelector("[data-frame]");
      const r = el?.querySelector("div.pointer-events-none")?.getBoundingClientRect();
      return { frame: el?.getAttribute("data-frame"), rect: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) } : null };
    })(),
  }));

  const tops = Object.fromEntries(meta.sections.map((s, i) => [i, s.top]));

  // scroll through the film sections
  await jump(tops[2] + 700);
  await shot("m02-craft");
  await jump(tops[3] + 700);
  await shot("m03-details");
  await jump(tops[4] + 700);
  await shot("m04-rail");
  await jump(tops[5] + 60);
  await shot("m05-collection");
  await jump(tops[6] + 500);
  await shot("m06-cta");
  await jump(meta.height - 844);
  await shot("m07-footer");

  // mobile menu
  await jump(0);
  await page.getByRole("button", { name: /open menu/i }).click();
  await page.waitForTimeout(400);
  await shot("m08-menu");
  await page.getByRole("button", { name: /close menu/i }).click();
  await page.waitForTimeout(300);

  // shop
  await page.goto("http://localhost:3000/shop", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await shot("m09-shop");
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(500);
  await shot("m10-shop-grid");

  // pdp + drawer
  await page.goto("http://localhost:3000/product/orbit-runner-01", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await shot("m11-product");
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: /^42$/ }).click();
  await page.getByRole("button", { name: /add to cart/i }).click();
  await page.waitForTimeout(700);
  await shot("m12-cart");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // checkout
  await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await shot("m13-checkout");

  const errors = logs.filter((l) => l.type === "error" || l.type === "pageerror");
  fs.writeFileSync(path.join(out, "mobile.json"), JSON.stringify({ meta, errors }, null, 2));
  await browser.close();
  console.log(JSON.stringify({ meta, errors }, null, 2));
})();
