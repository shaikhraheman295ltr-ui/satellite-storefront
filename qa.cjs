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
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const logs = [];
  page.on("console", (m) => logs.push({ type: m.type(), text: m.text() }));
  page.on("pageerror", (e) => logs.push({ type: "pageerror", text: e.message }));

  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  const jump = async (y) => {
    await page.evaluate((yy) => {
      const l = window.__lenis;
      if (l) l.scrollTo(yy, { immediate: true });
      else window.scrollTo(0, yy);
    }, y);
    await page.waitForTimeout(500);
  };

  const meta = await page.evaluate(() => ({
    height: document.body.scrollHeight,
    vh: innerHeight,
    sections: [...document.querySelectorAll("section")].map((s, i) => ({
      i,
      label: s.getAttribute("aria-label") || s.getAttribute("aria-labelledby") || s.className.slice(0, 40),
      top: Math.round(s.getBoundingClientRect().top + scrollY),
      h: Math.round(s.getBoundingClientRect().height),
    })),
    header: (() => {
      const h = document.querySelector("header");
      const r = h.getBoundingClientRect();
      const cs = getComputedStyle(h);
      return { top: r.top, h: r.height, bg: cs.backgroundColor, color: cs.color };
    })(),
    hud: (() => {
      const el = document.querySelector("[data-frame]");
      const spans = el ? [...el.querySelectorAll("span")].map((s) => s.textContent) : [];
      return { frame: el?.getAttribute("data-frame"), text: spans.slice(0, 8) };
    })(),
  }));

  // hero scrub test (downward only)
  const heroFrames = [];
  const heroYs = [0, 500, 1000, 1500, 2000, 2500, 2850];
  for (const y of heroYs) {
    await jump(y);
    heroFrames.push({
      y,
      frame: await page.evaluate(() => document.querySelector("[data-frame]")?.getAttribute("data-frame")),
    });
  }
  await jump(0);
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, "01-hero.png") });
  const heroLoading = await page.evaluate(() => {
    const box = [...document.querySelectorAll("div")].find((d) => /LOADING \d+%/.test(d.textContent || "") && d.children.length === 0);
    return box ? box.textContent : null;
  });

  const tops = Object.fromEntries(meta.sections.map((s) => [s.label.split(" ")[0].toLowerCase(), s.top]));
  const shots = [
    ["02-manifesto", 3908 + 120],
    ["03-craft", 4974 + 900],
    ["04-details", 8036 + 900],
    ["05-rail", 10738 + 1200],
    ["06-collection", 13388 + 80],
    ["07-cta", 14306 + 400],
    ["08-footer", meta.height - 900],
  ];
  const shotMeta = [];
  for (const [name, y] of shots) {
    await jump(y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(out, `${name}.png`) });
    shotMeta.push({
      name,
      y: await page.evaluate(() => Math.round(scrollY)),
      frames: await page.evaluate(() => [...document.querySelectorAll("[data-frame]")].map((el) => el.getAttribute("data-frame"))),
    });
  }

  const errors = logs.filter((l) => l.type === "error" || l.type === "pageerror");
  fs.writeFileSync(
    path.join(out, "qa.json"),
    JSON.stringify({ meta, heroFrames, heroLoading, shotMeta, errors, logs: logs.slice(0, 60) }, null, 2)
  );
  await browser.close();
  console.log(JSON.stringify({ meta, heroFrames, heroLoading, shotMeta, errors }, null, 2));
})();
