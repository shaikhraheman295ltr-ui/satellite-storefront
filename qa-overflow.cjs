const { chromium } = require("playwright-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  for (const route of ["/", "/about", "/shop"]) {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const data = await page.evaluate(() => {
      const vw = innerWidth;
      const all = [...document.querySelectorAll("*")];
      const offenders = all
        .map((el) => {
          const r = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id,
            cls: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 120),
            left: Math.round(r.left * 10) / 10,
            right: Math.round(r.right * 10) / 10,
            width: Math.round(r.width * 10) / 10,
            scrollWidth: el.scrollWidth,
            overflowX: style.overflowX,
            position: style.position,
            text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40),
          };
        })
        .filter((x) => x.right > vw + 0.5 || x.left < -0.5)
        .sort((a, b) => b.right - a.right)
        .slice(0, 25);
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth,
        offenders,
      };
    });
    console.log(route, JSON.stringify(data, null, 2));
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
