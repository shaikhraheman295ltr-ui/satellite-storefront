const { chromium } = require("playwright-core");
(async () => {
  const browser = await chromium.launch({
    executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: true,
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await page.goto("http://localhost:3000/shop", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const anchors = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="/product/"]')].slice(0, 6).map((a) => {
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      return {
        href: a.getAttribute("href"),
        label: a.getAttribute("aria-label"),
        text: (a.textContent || "").trim().slice(0, 30),
        box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        display: cs.display,
        vis: cs.visibility,
        pe: cs.pointerEvents,
        z: cs.zIndex,
      };
    })
  );
  console.log("anchors", JSON.stringify(anchors, null, 2));

  const first = page.locator('a[aria-label^="View "]').first();
  console.log("count", await first.count(), "box", await first.boundingBox());
  await first.click();
  await page.waitForTimeout(1600);
  console.log("url after overlay click", page.url());

  if (!page.url().includes("/product/")) {
    await page.goto("http://localhost:3000/shop", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const titleLink = page.locator('h3 a[href^="/product/"]').first();
    console.log("title count", await titleLink.count(), "box", await titleLink.boundingBox());
    await titleLink.click();
    await page.waitForTimeout(1600);
    console.log("url after title click", page.url());
  }

  await browser.close();
})();
