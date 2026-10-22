const { chromium } = require("playwright-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      isMobile: mobile,
      hasTouch: mobile,
      deviceScaleFactor: 1,
    });
    const p = await ctx.newPage();
    await p.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
    await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    const top = await p.evaluate(() => {
      const s = document.querySelector('section[aria-labelledby="details-title"]');
      return s ? s.getBoundingClientRect().top + scrollY : null;
    });
    await p.evaluate((y) => {
      const l = window.__lenis;
      if (l) l.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
    }, top);
    await p.waitForTimeout(1800);
    const sel = 'section[aria-labelledby="details-title"] [data-frame]';
    const a = await p.getAttribute(sel, "data-frame");
    await p.waitForTimeout(1500);
    const b = await p.getAttribute(sel, "data-frame");
    const canvas = await p.evaluate(() => {
      const c = document.querySelector('section[aria-labelledby="details-title"] canvas');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { cssW: +r.width.toFixed(1), cssH: +r.height.toFixed(1), attrW: c.width, attrH: c.height };
    });
    console.log(JSON.stringify({ viewport: `${w}x${h}`, top, a, b, autoplays: a !== b, canvas }));
    await ctx.close();
  }
  await browser.close();
})();
