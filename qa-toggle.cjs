const { chromium } = require("playwright-core");
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true,
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const btn = page.locator("header button[aria-pressed]").first();
  await btn.click();
  await page.waitForTimeout(200);
  const pressed = await btn.getAttribute("aria-pressed");
  const top = await page.evaluate(() => {
    const s = document.querySelector('section[aria-label^="Craft"]');
    return s ? s.getBoundingClientRect().top + scrollY : 0;
  });
  await page.evaluate((y) => {
    const l = window.__lenis;
    if (l) l.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, top);
  await page.waitForTimeout(1800);
  const sel = 'section[aria-label^="Craft"] [data-frame]';
  const a = await page.getAttribute(sel, "data-frame");
  await page.waitForTimeout(1400);
  const b = await page.getAttribute(sel, "data-frame");
  console.log(JSON.stringify({ pressed, a, b, stopped: a === b }));
  await browser.close();
})();
