const { chromium } = require("playwright-core");
(async () => {
  const browser = await chromium.launch({ executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => {
    const c = document.querySelector(".crosshair-cursor");
    return {
      rootClass: document.documentElement.classList.contains("cursor-none-desktop"),
      bodyCursor: getComputedStyle(document.body).cursor,
      opacity: c ? getComputedStyle(c).opacity : null,
    };
  });
  await page.mouse.move(700, 450);
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => {
    const c = document.querySelector(".crosshair-cursor");
    return {
      rootClass: document.documentElement.classList.contains("cursor-none-desktop"),
      bodyCursor: getComputedStyle(document.body).cursor,
      opacity: c ? getComputedStyle(c).opacity : null,
      transform: c ? getComputedStyle(c).transform : null,
    };
  });
  console.log(JSON.stringify({ before, after }, null, 2));
  await browser.close();
})();
