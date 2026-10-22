const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
const OUT = path.join(process.cwd(), "qa");

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const result = {};

  const newPage = async (ctx) => {
    const page = await ctx.newPage();
    await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
    return page;
  };
  const jump = async (page, y, wait = 800) => {
    await page.evaluate((yy) => {
      const l = window.__lenis;
      if (l) l.scrollTo(yy, { immediate: true });
      else window.scrollTo(0, yy);
    }, y);
    await page.waitForTimeout(wait);
  };
  const top = (page, sel) => page.evaluate((s) => {
    const e = document.querySelector(s);
    return e ? e.getBoundingClientRect().top + scrollY : null;
  }, sel);

  // 1. 768 overflow after footer fix
  result.overflow768 = {};
  {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 900 } });
    const page = await newPage(ctx);
    for (const route of ["/", "/about", "/shop"]) {
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(700);
      result.overflow768[route] = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth,
        overflow: document.documentElement.scrollWidth - innerWidth,
        footerSocial: (() => {
          const links = [...document.querySelectorAll('footer a[target="_blank"]')];
          return links.map((a) => {
            const r = a.getBoundingClientRect();
            return { text: a.textContent?.trim(), left: +r.left.toFixed(1), right: +r.right.toFixed(1), top: +r.top.toFixed(1) };
          });
        })(),
      }));
    }
    await ctx.close();
  }

  // 2. Mobile collection autoplay (short 16:9 frame) + v1 mobile paths
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
    });
    const page = await newPage(ctx);
    const reqs = [];
    page.on("request", (r) => {
      if (/\/frames\//.test(r.url())) reqs.push(r.url().replace(BASE, ""));
    });
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    const ctop = await top(page, 'section[aria-labelledby="collection-title"]');
    await jump(page, ctop + 300, 1500);
    const sel = 'section[aria-labelledby="collection-title"] [data-frame]';
    const a = await page.getAttribute(sel, "data-frame");
    await page.waitForTimeout(1600);
    const b = await page.getAttribute(sel, "data-frame");
    await page.screenshot({ path: path.join(OUT, "m20-collection-autoplay.png") });
    result.mobileCollection = {
      sectionTop: ctop,
      frameA: a,
      frameB: b,
      autoplays: a !== b,
      viewport: await page.evaluate(() => ({
        frame: (() => { const e = document.querySelector('section[aria-labelledby="collection-title"] [data-frame]'); if (!e) return null; const r = e.getBoundingClientRect(); return { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), height: +r.height.toFixed(1) }; })(),
        canHover: matchMedia("(hover: hover) and (pointer: fine)").matches,
      })),
      v1DesktopFrames: reqs.filter((u) => u.startsWith("/frames/v1/") && !u.startsWith("/frames/v1/m/")),
      v1MobileFrames: reqs.filter((u) => u.startsWith("/frames/v1/m/")).length,
      otherDesktopFrames: reqs.filter((u) => /^\/frames\/2\.\d\/f/.test(u)).slice(0, 5),
    };
    await ctx.close();
  }

  // 3. Fine pointer at a narrow viewport must still have a visible crosshair,
  // and a touch context must not hide the native cursor.
  {
    const ctx = await browser.newContext({ viewport: { width: 700, height: 800 } });
    const page = await newPage(ctx);
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.mouse.move(350, 400);
    await page.waitForTimeout(250);
    result.cursorNarrow = await page.evaluate(() => {
      const el = document.querySelector(".crosshair-cursor");
      const cs = el ? getComputedStyle(el) : null;
      return {
        rootClass: document.documentElement.classList.contains("cursor-none-desktop"),
        display: cs?.display,
        opacity: cs?.opacity,
        transform: cs?.transform,
        bodyCursor: getComputedStyle(document.body).cursor,
      };
    });
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1,
    });
    const page = await newPage(ctx);
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    result.cursorTouch = await page.evaluate(() => ({
      fine: matchMedia("(hover: hover) and (pointer: fine)").matches,
      rootClass: document.documentElement.classList.contains("cursor-none-desktop"),
      bodyCursor: getComputedStyle(document.body).cursor,
    }));
    await ctx.close();
  }

  // 4. v1 hero still scrubs (unchanged, exclusion only removes auto-loop)
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await newPage(ctx);
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const sel = 'section[aria-label^="Hero"] [data-frame]';
    const before = await page.getAttribute(sel, "data-frame");
    await jump(page, 1400, 800);
    const after = await page.getAttribute(sel, "data-frame");
    await page.waitForTimeout(1300);
    const afterIdle = await page.getAttribute(sel, "data-frame");
    result.v1Scrub = {
      before,
      after,
      afterIdle,
      scrollWorks: before !== after,
      noContinuousLoop: after === afterIdle,
    };
    await page.screenshot({ path: path.join(OUT, "d20-hero-scrub.png") });
    await ctx.close();
  }

  // 5. Size picker stores the selected size, not a default.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await newPage(ctx);
    await page.goto(BASE + "/shop", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: /choose a size/i }).first().click();
    await page.waitForTimeout(200);
    await page.locator('[role="group"][aria-label^="Choose a size"]').first()
      .getByRole("button", { name: /Add EU 41 to cart/i }).click();
    await page.waitForTimeout(500);
    result.sizePicker = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem("sh-cart-v1") || "[]");
      return {
        count: data.items?.length ?? 0,
        size: data.items?.[0]?.size,
        name: data.items?.[0]?.name,
        dialogOpen: !!document.querySelector('[role="dialog"][aria-label="Shopping cart"]'),
      };
    });
    await ctx.close();
  }

  fs.writeFileSync(path.join(OUT, "recheck.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
