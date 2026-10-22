/**
 * Complete read-only health check for the local production build.
 * Run: node qa-health.cjs
 * Output: qa/health.json
 */
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const BASE = process.env.QA_BASE || "http://localhost:3000";
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = path.join(process.cwd(), "qa");
const PRODUCTS = [
  "orbit-runner-01",
  "eclipse-runner-low",
  "hollow-court",
  "meridian-slip",
  "terra-terra-hiker",
  "void-chukka",
  "night-owl-mid",
  "phantom-runner-gt",
];
const ROUTES = [
  "/",
  "/shop",
  "/shop?c=RUNNER",
  "/about",
  "/contact",
  "/checkout",
  "/wishlist",
  ...PRODUCTS.map((s) => `/product/${s}`),
  "/does-not-exist",
  "/product/does-not-exist",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function timedFetch(url, opts = {}) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(opts.timeout || 15000),
      headers: { "user-agent": "qa-health/1.0" },
    });
    return { url, status: res.status, location: res.headers.get("location"), ms: Date.now() - started };
  } catch (e) {
    return { url, status: "ERR", error: e.message, ms: Date.now() - started };
  }
}

async function requestText(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return { status: res.status, headers: Object.fromEntries(res.headers), text: await res.text() };
  } catch (e) {
    return { status: "ERR", error: e.message, text: "" };
  }
}

async function newPage(browser, viewport = { width: 1440, height: 900 }, extra = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...extra });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem("sh-pre", "1"));
  return { ctx, page };
}

function installListeners(page, bucket) {
  page.on("console", (m) => {
    if (m.type() === "error") bucket.console.push({ url: page.url(), text: m.text().slice(0, 500) });
  });
  page.on("pageerror", (e) => bucket.pageErrors.push({ url: page.url(), text: e.message.slice(0, 500) }));
  page.on("requestfailed", (r) => {
    const err = r.failure()?.errorText || "failed";
    if (!/ERR_ABORTED/.test(err)) bucket.failedRequests.push({ url: r.url(), error: err });
  });
  page.on("response", (r) => {
    if (r.status() >= 500) bucket.serverErrors.push({ status: r.status(), url: r.url() });
    if (r.status() >= 400 && !/does-not-exist/.test(r.url())) {
      bucket.badResponses.push({ status: r.status(), url: r.url() });
    }
    if (r.request().resourceType() === "image" && r.status() >= 400) {
      bucket.brokenImages.push({ status: r.status(), url: r.url() });
    }
  });
}

async function loadLazy(page) {
  await page.evaluate(async () => {
    const step = Math.max(400, Math.floor(innerHeight * 0.8));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 20));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(350);
}

async function routePass(browser, route) {
  const { ctx, page } = await newPage(browser);
  const bucket = {
    console: [],
    pageErrors: [],
    failedRequests: [],
    badResponses: [],
    serverErrors: [],
    brokenImages: [],
  };
  installListeners(page, bucket);
  let status = 0;
  let responseMs = 0;
  let navError = null;
  const started = Date.now();
  try {
    const res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
    responseMs = Date.now() - started;
    status = res?.status() ?? 0;
    await page.waitForTimeout(450);
    await loadLazy(page);
  } catch (e) {
    navError = e.message;
  }

  const dom = await page.evaluate(() => {
    const attr = (sel, a) => document.querySelector(sel)?.getAttribute(a) || null;
    const text = (sel) => document.querySelector(sel)?.textContent?.replace(/\s+/g, " ").trim() || null;
    const imgs = [...document.images].map((i) => ({
      src: i.currentSrc || i.src,
      raw: i.getAttribute("src") || "",
      alt: i.getAttribute("alt"),
      complete: i.complete,
      naturalWidth: i.naturalWidth,
      loading: i.getAttribute("loading"),
    }));
    const srcset = [...document.querySelectorAll("img[srcset], source[srcset]")].flatMap((el) =>
      (el.getAttribute("srcset") || "").split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean)
    );
    const controls = [...document.querySelectorAll("button, a, input, select, textarea")].map((el) => {
      const tag = el.tagName.toLowerCase();
      const label =
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.textContent?.replace(/\s+/g, " ").trim() ||
        el.getAttribute("placeholder") ||
        "";
      const id = el.getAttribute("id");
      const labelled =
        tag === "input" || tag === "select" || tag === "textarea"
          ? !!(
              el.closest("label") ||
              (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
              el.getAttribute("aria-label") ||
              el.getAttribute("aria-labelledby")
            )
          : true;
      return { tag, label: label.slice(0, 80), labelled, type: el.getAttribute("type") };
    });
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    const dupIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    const anchors = [...document.querySelectorAll("a[href]")].map((a) => ({
      href: a.getAttribute("href"),
      text: a.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
      target: a.getAttribute("target"),
      rel: a.getAttribute("rel"),
    }));
    return {
      title: document.title,
      lang: document.documentElement.lang,
      description: attr('meta[name="description"]', "content"),
      canonical: attr('link[rel="canonical"]', "href"),
      robots: attr('meta[name="robots"]', "content"),
      ogTitle: attr('meta[property="og:title"]', "content"),
      ogDescription: attr('meta[property="og:description"]', "content"),
      ogImage: attr('meta[property="og:image"]', "content"),
      ogUrl: attr('meta[property="og:url"]', "content"),
      twitterCard: attr('meta[name="twitter:card"]', "content"),
      twitterImage: attr('meta[name="twitter:image"]', "content"),
      viewport: attr('meta[name="viewport"]', "content"),
      themeColor: attr('meta[name="theme-color"]', "content"),
      h1s: [...document.querySelectorAll("h1")].map((h) => h.textContent.replace(/\s+/g, " ").trim()),
      h2Count: document.querySelectorAll("h2").length,
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent.slice(0, 1200)),
      imgs,
      srcset: [...new Set(srcset)],
      brokenImgs: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      emptyAlt: imgs.filter((i) => i.alt === null).length,
      emptyLinks: anchors.filter((a) => !a.href || a.href === "#").map((a) => a.text),
      anchors,
      unlabelledControls: controls.filter((c) => !c.label).slice(0, 20),
      unlabelledFields: controls.filter((c) => ["input", "select", "textarea"].includes(c.tag) && !c.labelled).slice(0, 20),
      duplicateIds: dupIds,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      bodyText: document.body.innerText.slice(0, 500),
      contentLength: document.documentElement.innerHTML.length,
    };
  });

  // Check every rendered image URL and srcset candidate for a real 200.
  const imageUrls = [...new Set([...dom.imgs.map((i) => i.src), ...dom.srcset])]
    .filter(Boolean)
    .map((u) => (u.startsWith("http") ? u : BASE + u));
  const imageChecks = [];
  for (const url of imageUrls) {
    const r = await timedFetch(url, { timeout: 10000 });
    imageChecks.push({ url, status: r.status, ms: r.ms });
  }

  await ctx.close();
  return {
    route,
    status,
    responseMs,
    navError,
    console: bucket.console,
    pageErrors: bucket.pageErrors,
    failedRequests: bucket.failedRequests,
    badResponses: bucket.badResponses,
    serverErrors: bucket.serverErrors,
    brokenImages: bucket.brokenImages,
    imageChecks,
    ...dom,
  };
}

async function internalLinkCrawl(browser, routes) {
  const links = new Set();
  {
    const { ctx, page } = await newPage(browser);
    for (const r of routes.slice(0, 7)) {
      await page.goto(BASE + r, { waitUntil: "networkidle", timeout: 45000 });
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll("a[href]")]
          .map((a) => a.getAttribute("href"))
          .filter((h) => h && h.startsWith("/") && !h.startsWith("//") && !h.startsWith("/_next/"))
      );
      hrefs.forEach((h) => links.add(h));
    }
    await ctx.close();
  }
  const results = [];
  for (const href of [...new Set([...links, ...routes.filter((r) => !r.includes("does-not-exist"))])].sort()) {
    results.push(await timedFetch(BASE + href));
  }
  return results;
}

async function securityPass() {
  const home = await requestText(BASE + "/");
  const paths = [
    "/.env",
    "/.env.local",
    "/.git/config",
    "/package.json",
    "/package-lock.json",
    "/next.config.js",
    "/.next/BUILD_ID",
    "/.next/server/app/page.js",
    "/api",
    "/api/health",
    "/api/razorpay/order",
    "/server.js",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/images/hero-poster.webp",
    "/_next/static/chunks/polyfills-42372ed130431b0a.js",
  ];
  const checks = [];
  for (const p of paths) {
    const r = await timedFetch(BASE + p);
    checks.push({ path: p, status: r.status, ms: r.ms, location: r.location || null });
  }
  const headers = {};
  for (const [k, v] of Object.entries(home.headers || {})) headers[k.toLowerCase()] = v;
  const securityHeaders = {
    "x-powered-by": headers["x-powered-by"] || null,
    "x-content-type-options": headers["x-content-type-options"] || null,
    "x-frame-options": headers["x-frame-options"] || null,
    "referrer-policy": headers["referrer-policy"] || null,
    "permissions-policy": headers["permissions-policy"] || null,
    "content-security-policy": headers["content-security-policy"] || null,
    "strict-transport-security": headers["strict-transport-security"] || null,
    "cross-origin-opener-policy": headers["cross-origin-opener-policy"] || null,
  };
  return { checks, securityHeaders, status: home.status, ms: home.ms, bytes: home.text.length };
}

async function seoPass() {
  const robots = await requestText(BASE + "/robots.txt");
  const sitemap = await requestText(BASE + "/sitemap.xml");
  const locs = [...sitemap.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  const localLocs = locs.map((u) => {
    try {
      const x = new URL(u);
      return { url: u, path: x.pathname + x.search, host: x.origin };
    } catch {
      return { url: u, path: null, host: null };
    }
  });
  const statuses = [];
  for (const l of localLocs) if (l.path) statuses.push({ ...l, ...(await timedFetch(BASE + l.path)) });
  return { robotsStatus: robots.status, robots: robots.text.trim(), sitemapStatus: sitemap.status, locs, localLocs, statuses };
}

async function flows(browser) {
  const result = {};
  const { ctx, page } = await newPage(browser);
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(e.message));

  // Search
  await page.goto(BASE + "/shop", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /open search/i }).click();
  await page.waitForTimeout(350);
  const searchOpen = await page.getByRole("dialog", { name: /search products/i }).isVisible().catch(() => false);
  await page.getByLabel("QUERY").fill("runner");
  await page.waitForTimeout(250);
  const searchResults = await page.locator('[role="dialog"] a[href^="/product/"]').count();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(800);
  result.search = { open: searchOpen, results: searchResults, urlAfterEnter: page.url(), errors: [...errors] };

  // Quick-add size picker + wishlist + cart
  await page.goto(BASE + "/shop", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("sh-cart-v1"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const choose = page.getByRole("button", { name: /choose a size/i }).first();
  await choose.click();
  await page.waitForTimeout(300);
  const group = page.locator('[role="group"][aria-label^="Choose a size"]').first();
  const pickerOpen = await group.isVisible().catch(() => false);
  const sizeButton = group.getByRole("button", { name: /Add EU 42 to cart/i }).first();
  const sizeExists = await sizeButton.isVisible().catch(() => false);
  if (sizeExists) await sizeButton.click();
  await page.waitForTimeout(600);
  const cart = await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("sh-cart-v1") || "null");
    return { data: d, dialog: !!document.querySelector('[role="dialog"][aria-label="Shopping cart"]') };
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const heart = page.locator('button[aria-label="Save to wishlist"]').first();
  await heart.click();
  await page.waitForTimeout(400);
  const wish = await page.evaluate(() => ({
    stored: JSON.parse(localStorage.getItem("sh-cart-v1") || "null")?.wish,
    header: document.querySelector("header")?.innerText,
  }));
  await page.goto(BASE + "/wishlist", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  result.shop = {
    pickerOpen,
    sizeExists,
    cart,
    wish,
    wishlistHeading: await page.locator("h1").innerText().catch(() => null),
  };

  // Checkout through cart dialog, seeded to avoid state dependency.
  await page.evaluate(() => localStorage.setItem("sh-cart-v1", JSON.stringify({
    items: [
      { slug: "orbit-runner-01", name: "ORBIT RUNNER 01", price: 8490, size: 42, index: "001", image: "/images/16.webp", qty: 1 },
    ],
    wish: [],
  })));
  await page.goto(BASE + "/checkout", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.getByLabel("EMAIL *").fill("qa@example.com");
  await page.getByLabel("PHONE *").fill("9999999999");
  await page.getByLabel("FIRST NAME *").fill("QA");
  await page.getByLabel("LAST NAME *").fill("Runner");
  await page.getByLabel("ADDRESS *").fill("1 Test Street");
  await page.getByLabel("CITY *").fill("Mumbai");
  await page.getByLabel("STATE *").fill("Maharashtra");
  await page.getByLabel("PIN *").fill("400001");
  await page.getByRole("button", { name: /pay securely/i }).click();
  await page.waitForTimeout(700);
  result.checkout = await page.evaluate(() => ({
    heading: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim(),
    focused: document.activeElement === document.querySelector("h1"),
    cart: JSON.parse(localStorage.getItem("sh-cart-v1") || "null"),
    body: document.body.innerText.slice(0, 300),
  }));

  // Contact + newsletter
  await page.goto(BASE + "/contact", { waitUntil: "networkidle" });
  await page.getByLabel("NAME *").fill("QA");
  await page.getByLabel("EMAIL *").fill("qa@example.com");
  await page.getByLabel("MESSAGE *").fill("QA health check");
  await page.getByRole("button", { name: /send message/i }).click();
  await page.waitForTimeout(350);
  result.contact = {
    success: await page.getByText(/MESSAGE \/ RECEIVED/i).isVisible().catch(() => false),
    focused: await page.evaluate(() => document.activeElement?.getAttribute("role")),
  };
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel("Email address").fill("qa@example.com");
  await page.getByRole("button", { name: /subscribe/i }).click();
  await page.waitForTimeout(350);
  result.newsletter = {
    success: await page.getByText(/SUBSCRIBED/i).first().isVisible().catch(() => false),
    focused: await page.evaluate(() => document.activeElement?.getAttribute("role")),
  };
  result.consoleErrors = errors;
  await ctx.close();
  return result;
}

async function responsivePass(browser) {
  const widths = [320, 360, 390, 768, 1024, 1440];
  const routes = ["/", "/shop", "/about", "/contact", "/product/orbit-runner-01", "/checkout", "/wishlist"];
  const rows = [];
  for (const width of widths) {
    const mobile = width < 768;
    const { ctx, page } = await newPage(
      browser,
      { width, height: mobile ? 800 : 900 },
      { isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 }
    );
    for (const route of routes) {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(250);
      const data = await page.evaluate(() => {
        const wide = [...document.querySelectorAll("body *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            if (!r.width || !r.height || s.position === "fixed" || s.visibility === "hidden") return false;
            if (r.right > innerWidth + 2 || r.left < -2) {
              if (el.closest(".marquee-track")) return false;
              return true;
            }
            return false;
          })
          .slice(0, 5)
          .map((el) => ({
            tag: el.tagName,
            cls: (el.className || "").toString().slice(0, 60),
            text: (el.textContent || "").trim().slice(0, 40),
            right: Math.round(el.getBoundingClientRect().right),
          }));
        return {
          sw: document.documentElement.scrollWidth,
          vw: innerWidth,
          overflow: document.documentElement.scrollWidth - innerWidth,
          wide,
        };
      });
      rows.push({ width, route, ...data });
    }
    await ctx.close();
  }
  return rows;
}

async function headersAndPerf() {
  const routes = ["/", "/shop", "/product/orbit-runner-01", "/about", "/contact", "/checkout", "/wishlist", "/does-not-exist"];
  const rows = [];
  for (const route of routes) {
    for (let i = 0; i < 2; i++) {
      const r = await timedFetch(BASE + route);
      rows.push({ route, attempt: i + 1, status: r.status, ms: r.ms });
    }
  }
  return rows;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const result = { generatedAt: new Date().toISOString(), base: BASE, routes: [] };

  for (const route of ROUTES) {
    try {
      result.routes.push(await routePass(browser, route));
    } catch (e) {
      result.routes.push({ route, fatal: e.message });
    }
  }
  result.internalLinks = await internalLinkCrawl(browser, ROUTES);
  result.security = await securityPass();
  result.seo = await seoPass();
  result.flows = await flows(browser);
  result.responsive = await responsivePass(browser);
  result.timings = await headersAndPerf();
  await browser.close();

  fs.writeFileSync(path.join(OUT, "health.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({
    routes: result.routes.map((r) => ({
      route: r.route,
      status: r.status,
      responseMs: r.responseMs,
      title: r.title,
      canonical: r.canonical,
      h1s: r.h1s,
      console: r.console?.length,
      pageErrors: r.pageErrors?.length,
      failed: r.failedRequests?.length,
      bad: r.badResponses?.length,
      brokenImages: r.brokenImgs?.length,
      overflow: r.overflow,
    })),
    internalLinks: result.internalLinks.filter((l) => l.status !== 200),
    security: result.security,
    seo: { robots: result.seo.robots, sitemap: result.seo.locs, statuses: result.seo.statuses },
    flows: result.flows,
    responsive: result.responsive.filter((r) => r.overflow),
    timings: result.timings,
  }, null, 2));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
