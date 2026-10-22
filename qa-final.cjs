const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
const OUT = path.join(process.cwd(), "qa");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const result = { consoleErrors: [], badResponses: [] };

  const makePage = async (ctx) => {
    const p = await ctx.newPage();
    p.on("console", (m) => {
      if (m.type() === "error") result.consoleErrors.push({ url: p.url(), text: m.text() });
    });
    p.on("pageerror", (e) => result.consoleErrors.push({ url: p.url(), text: e.message }));
    p.on("response", (r) => {
      if (r.status() >= 400 && !/does-not-exist/.test(r.url())) result.badResponses.push({ status: r.status(), url: r.url() });
    });
    await p.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
    return p;
  };
  const jump = async (p, y, wait = 700) => {
    await p.evaluate((yy) => {
      const l = window.__lenis;
      if (l) l.scrollTo(yy, { immediate: true });
      else window.scrollTo(0, yy);
    }, y);
    await p.waitForTimeout(wait);
  };
  const top = (p, s) => p.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? el.getBoundingClientRect().top + scrollY : null;
  }, s);

  /* Wishlist end-to-end + header count */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await makePage(ctx);
    await p.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    const firstSave = p.getByRole("button", { name: "Save to wishlist" }).first();
    await firstSave.click();
    await p.waitForTimeout(300);
    const stored = await p.evaluate(() => JSON.parse(localStorage.getItem("sh-cart-v1") || "{}").wish || []);
    const headerSaved = await p.locator('header a[href="/wishlist"]').textContent();
    await p.locator('header a[href="/wishlist"]').click();
    await p.waitForURL("**/wishlist");
    await p.waitForTimeout(700);
    const wishlist = await p.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim(),
      cards: document.querySelectorAll("article").length,
      empty: /NOTHING\s*SAVED/i.test(document.body.textContent || ""),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
      overflow: document.documentElement.scrollWidth - innerWidth,
    }));
    await p.screenshot({ path: path.join(OUT, "d21-wishlist.png"), fullPage: true });
    const remove = p.getByRole("button", { name: "Remove from wishlist" }).first();
    await remove.click();
    await p.waitForTimeout(500);
    const afterRemove = await p.evaluate(() => ({
      cards: document.querySelectorAll("article").length,
      emptyVisible: !!document.querySelector("main")?.textContent?.match(/NOTHING\s*SAVED/i),
      headerSaved: document.querySelector('header a[href="/wishlist"]')?.textContent?.trim(),
      wish: JSON.parse(localStorage.getItem("sh-cart-v1") || "{}").wish || [],
    }));
    result.wishlist = { stored, headerSaved, wishlist, afterRemove };
    await ctx.close();
  }

  /* Reveals actually transition + canvas sizing */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await makePage(ctx);
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await p.waitForTimeout(600);
    const canvas = await p.evaluate(() => {
      const c = document.querySelector("canvas");
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { cssW: +r.width.toFixed(1), cssH: +r.height.toFixed(1), attrW: c.width, attrH: c.height, dpr: devicePixelRatio };
    });
    const manifestoTop = await top(p, 'section[aria-labelledby="manifesto-title"]');
    await jump(p, manifestoTop, 900);
    const reveals = await p.evaluate(() => [...document.querySelectorAll(".reveal")].map((el) => ({
      visible: el.classList.contains("is-visible"),
      opacity: getComputedStyle(el).opacity,
      transform: getComputedStyle(el).transform,
      top: +el.getBoundingClientRect().top.toFixed(1),
    })));
    await p.screenshot({ path: path.join(OUT, "d22-manifesto-reveal.png") });

    await p.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    const shopReveal = await p.evaluate(() => {
      const els = [...document.querySelectorAll(".reveal")];
      return {
        count: els.length,
        visible: els.filter((e) => e.classList.contains("is-visible")).length,
        firstOpacity: els[0] ? getComputedStyle(els[0]).opacity : null,
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });

    result.reveals = { reveals, shopReveal, canvas };
    await ctx.close();
  }

  /* Cursor over form field vs link */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await makePage(ctx);
    await p.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    const input = p.locator('input[placeholder="FULL NAME"]');
    const ib = await input.boundingBox();
    if (ib) await p.mouse.move(ib.x + ib.width / 2, ib.y + ib.height / 2);
    await p.waitForTimeout(200);
    const overField = await p.evaluate(() => {
      const cursor = document.querySelector(".crosshair-cursor");
      const input = document.querySelector('input[placeholder="FULL NAME"]');
      return {
        crosshairOpacity: cursor ? getComputedStyle(cursor).opacity : null,
        native: cursor?.getAttribute("data-native"),
        inputCursor: input ? getComputedStyle(input).cursor : null,
      };
    });
    const navLink = p.locator('header a[href="/shop"]');
    const nb = await navLink.boundingBox();
    if (nb) await p.mouse.move(nb.x + nb.width / 2, nb.y + nb.height / 2);
    await p.waitForTimeout(250);
    const overLink = await p.evaluate(() => {
      const cursor = document.querySelector(".crosshair-cursor");
      return {
        opacity: cursor ? getComputedStyle(cursor).opacity : null,
        hover: cursor?.getAttribute("data-hover"),
        width: cursor ? getComputedStyle(cursor).width : null,
      };
    });
    result.cursorContext = { overField, overLink };
    await ctx.close();
  }

  /* Wishlist mobile empty state + header menu link */
  {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 800 }, isMobile: true, hasTouch: true });
    const p = await makePage(ctx);
    await p.goto(`${BASE}/wishlist`, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    const empty = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      h1Rect: (() => { const h = document.querySelector("h1"); const r = h?.getBoundingClientRect(); return r ? { left: r.left, right: r.right } : null; })(),
      links: [...document.querySelectorAll("a")].filter((a) => a.getAttribute("href") === "/shop").length,
    }));
    await p.getByRole("button", { name: "Open menu" }).click();
    await p.waitForTimeout(300);
    const menu = await p.evaluate(() => ({
      dialog: !!document.querySelector('[role="dialog"][aria-label="Menu"]'),
      savedLink: !!document.querySelector('[role="dialog"] a[href="/wishlist"]'),
      active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim(),
    }));
    await p.keyboard.press("Escape");
    result.wishlistMobile = { empty, menu };
    await ctx.close();
  }

  /* v1 wheel scrub, then stable (no autoplay loop) */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await makePage(ctx);
    await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1500);
    const sel = 'section[aria-label^="Hero"] [data-frame]';
    const before = await p.getAttribute(sel, "data-frame");
    await p.mouse.move(720, 450);
    await p.mouse.wheel(0, 1600);
    await p.waitForTimeout(1800);
    const after = await p.getAttribute(sel, "data-frame");
    await p.waitForTimeout(1600);
    const later = await p.getAttribute(sel, "data-frame");
    result.v1Wheel = { before, after, later, stable: after === later, delta: Number(later) - Number(after) };
    await ctx.close();
  }

  fs.writeFileSync(path.join(OUT, "final.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
