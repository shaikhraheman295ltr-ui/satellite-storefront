const { chromium } = require("playwright-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 768, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const vw = innerWidth;
    const all = [...document.querySelectorAll("*")];
    const near = all.map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === "string" ? el.className : "").slice(0, 100),
        left: +r.left.toFixed(1), right: +r.right.toFixed(1), width: +r.width.toFixed(1),
        pos: s.position, ov: s.overflowX, transform: s.transform,
        text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30),
      };
    }).filter((x) => x.right > vw - 1 && x.right < vw + 30 && x.width < vw + 30);
    return {
      innerWidth: vw,
      docClientWidth: document.documentElement.clientWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      bodyRect: (() => { const r = document.body.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width }; })(),
      htmlRect: (() => { const r = document.documentElement.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width }; })(),
      near,
      fixed: all.filter((el) => getComputedStyle(el).position === "fixed").map((el) => {
        const r = el.getBoundingClientRect();
        return { cls: (typeof el.className === "string" ? el.className : "").slice(0, 80), left: r.left, right: r.right, width: r.width, display: getComputedStyle(el).display };
      }),
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
