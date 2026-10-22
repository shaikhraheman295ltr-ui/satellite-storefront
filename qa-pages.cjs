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
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const logs = [];
  page.on("console", (m) => logs.push({ type: m.type(), url: page.url(), text: m.text() }));
  page.on("pageerror", (e) => logs.push({ type: "pageerror", url: page.url(), text: e.message }));

  const shot = async (name) => {
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(out, `${name}.png`) });
  };

  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));

  // ---------- shop ----------
  await page.goto("http://localhost:3000/shop", { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await shot("p01-shop");

  await page.locator('a[aria-label^="View "]').first().click();
  await page.waitForURL("**/product/**", { timeout: 8000 });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(700);
  await shot("p02-product");

  const pdp = await page.evaluate(() => ({
    url: location.pathname,
    title: document.querySelector("h1")?.textContent,
    titleTag: document.title,
    price: [...document.querySelectorAll("span")].find((e) => /₹/.test(e.textContent || ""))?.textContent,
    sizes: [...document.querySelectorAll("button[aria-pressed]")].map((b) => b.textContent?.trim()).filter(Boolean),
    h1: [...document.querySelectorAll("h1")].map((h) => h.textContent?.trim()),
    jsonLd: !!document.querySelector('script[type="application/ld+json"]'),
  }));

  // size guide disclosure
  const guideBtn = page.getByRole("button", { name: /size guide/i });
  await guideBtn.click();
  await page.waitForTimeout(300);
  const guide = await page.evaluate(() => {
    const el = document.querySelector("#size-guide");
    return el ? { visible: true, text: el.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) } : null;
  });
  await shot("p03-size-guide");

  // add to cart
  await page.getByRole("button", { name: /^42$/ }).click();
  await page.getByRole("button", { name: /add to cart/i }).click();
  await page.waitForTimeout(700);
  const drawer = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"][aria-label="Shopping cart"]');
    return {
      open: !!d && d.getAttribute("aria-hidden") !== "true" && !d.closest("[inert]"),
      text: d?.textContent?.replace(/\s+/g, " ").trim().slice(0, 200),
      focused: document.activeElement?.textContent?.trim(),
    };
  });
  await shot("p04-cart-drawer");

  // close via Escape, focus should return to add button
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const afterClose = await page.evaluate(() => ({
    drawerHidden: document.querySelector('[role="dialog"][aria-label="Shopping cart"]')?.closest("[inert]") !== null,
    focus: document.activeElement?.textContent?.trim().slice(0, 40),
  }));

  // ---------- checkout ----------
  await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot("p05-checkout");
  const checkout = await page.evaluate(() => ({
    title: document.title,
    items: [...document.querySelectorAll("li")].map((l) => l.textContent?.replace(/\s+/g, " ").trim()).filter((t) => /₹/.test(t || "")).slice(0, 3),
    body: document.body.textContent?.replace(/\s+/g, " ").trim().slice(0, 220),
  }));

  // ---------- about / contact / 404 ----------
  await page.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await shot("p06-about");

  await page.goto("http://localhost:3000/contact", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await shot("p07-contact");

  await page.goto("http://localhost:3000/does-not-exist", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await shot("p08-404");

  // ---------- search overlay ----------
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  await page.getByRole("button", { name: /open search/i }).click();
  await page.waitForTimeout(400);
  await page.keyboard.type("orbit");
  await page.waitForTimeout(500);
  await shot("p09-search");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/product/**", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(600);
  const search = { url: page.url() };

  // ---------- autoplay toggle ----------
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  const autoBtn = page.getByRole("button", { name: /auto/i }).first();
  const autoBefore = await autoBtn.getAttribute("aria-pressed");
  await autoBtn.click();
  await page.waitForTimeout(300);
  const autoAfter = await autoBtn.getAttribute("aria-pressed");
  const autoLabel = await autoBtn.textContent();

  // ---------- a11y audit ----------
  const audits = {};
  for (const url of ["/", "/shop", "/product/orbit-runner-01", "/about", "/contact", "/checkout"]) {
    await page.goto("http://localhost:3000" + url, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    audits[url] = await page.evaluate(() => {
      const name = (el) =>
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        (el.textContent || "").replace(/\s+/g, " ").trim();
      return {
        noAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.getAttribute("src")),
        emptyButtons: [...document.querySelectorAll("button")].filter((b) => !name(b)).length,
        emptyLinks: [...document.querySelectorAll("a")].filter((a) => !name(a)).length,
        h1: [...document.querySelectorAll("h1")].map((h) => h.textContent?.trim()),
        title: document.title,
        lang: document.documentElement.lang,
      };
    });
  }

  const errors = logs.filter((l) => l.type === "error" || l.type === "pageerror");
  fs.writeFileSync(
    path.join(out, "pages.json"),
    JSON.stringify({ pdp, guide, drawer, afterClose, checkout, search, autoBefore, autoAfter, autoLabel, audits, errors }, null, 2)
  );
  await browser.close();
  console.log(JSON.stringify({ pdp, guide, drawer, afterClose, checkout, search, autoBefore, autoAfter, autoLabel, audits, errors }, null, 2));
})();
