const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

(async () => {
  const out = path.join(process.cwd(), "qa");
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });

  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const logs = [];
  page.on("console", (m) => logs.push({ type: m.type(), text: m.text() }));
  page.on("pageerror", (e) => logs.push({ type: "pageerror", text: e.message }));
  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(300);
  const opened = await page.evaluate(() => ({
    dialog: !!document.querySelector('[role="dialog"][aria-label="Menu"]'),
    focused: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 30),
  }));
  await page.keyboard.press("Shift+Tab");
  const shiftTab = await page.evaluate(() => document.activeElement?.textContent?.replace(/\s+/g, " ").trim().slice(0, 40));
  await page.keyboard.press("Tab");
  const tabBack = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 30));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  const closed = await page.evaluate(() => ({
    dialog: !!document.querySelector('[role="dialog"][aria-label="Menu"]'),
    focused: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 30),
  }));

  // mobile collection copy
  const ctop = await page.evaluate(() => {
    const s = document.querySelector('section[aria-labelledby="collection-title"]');
    return s ? s.getBoundingClientRect().top + scrollY : 0;
  });
  await page.evaluate((y) => window.scrollTo(0, y), ctop + 260);
  await page.waitForTimeout(2500);
  const collectionCopy = await page.evaluate(() => {
    const s = document.querySelector('section[aria-labelledby="collection-title"]');
    return s ? s.innerText.replace(/\s+/g, " ").trim() : "";
  });
  await page.screenshot({ path: path.join(out, "m20-collection-copy.png") });

  // desktop collection hover
  const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const dp = await dctx.newPage();
  await dp.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await dp.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await dp.waitForTimeout(1400);
  const dtop = await dp.evaluate(() => {
    const s = document.querySelector('section[aria-labelledby="collection-title"]');
    return s ? s.getBoundingClientRect().top + scrollY : 0;
  });
  await dp.evaluate((y) => window.scrollTo(0, y), dtop - 150);
  await dp.waitForTimeout(1800);
  const sel = 'section[aria-labelledby="collection-title"] [data-frame]';
  const f0 = await dp.getAttribute(sel, "data-frame");
  const b = await dp.locator(sel).boundingBox();
  if (b) await dp.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await dp.waitForTimeout(700);
  const f1 = await dp.getAttribute(sel, "data-frame");
  await dp.mouse.move(10, 10);
  await dp.waitForTimeout(900);
  const f2 = await dp.getAttribute(sel, "data-frame");
  await dp.screenshot({ path: path.join(out, "d21-collection-hover.png") });

  const errors = logs.filter((l) => l.type === "error" || l.type === "pageerror");
  const result = { opened, shiftTab, tabBack, closed, collectionCopy, desktopHover: { f0, f1, f2 }, errors };
  fs.writeFileSync(path.join(out, "menu.json"), JSON.stringify(result, null, 2));
  await browser.close();
  console.log(JSON.stringify(result, null, 2));
})();
