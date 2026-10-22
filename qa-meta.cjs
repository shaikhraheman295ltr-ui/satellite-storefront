const BASE = process.env.QA_BASE || "http://localhost:3000";
const routes = ["/", "/shop", "/product/orbit-runner-01", "/about", "/contact", "/checkout", "/wishlist", "/does-not-exist", "/product/does-not-exist"];

(async () => {
  for (const route of routes) {
    const res = await fetch(BASE + route);
    const html = await res.text();
    const get = (re) => html.match(re)?.[1] ?? null;
    const title = get(/<title>([\s\S]*?)<\/title>/);
    const desc = get(/<meta name="description" content="([^"]*)"/);
    const canonical = get(/<link rel="canonical" href="([^"]*)"/);
    const ogTitle = get(/<meta property="og:title" content="([^"]*)"/);
    const ogImage = get(/<meta property="og:image" content="([^"]*)"/);
    const robots = get(/<meta name="robots" content="([^"]*)"/);
    const head = get(/<head>([\s\S]*?)<\/head>/);
    console.log(JSON.stringify({ route, status: res.status, title, desc, canonical, ogTitle, ogImage, robots, headBytes: head?.length, htmlBytes: html.length }));
    if (route === "/shop") {
      console.log("SHOP TITLE SNIPPET", JSON.stringify(head?.slice(0, 500)));
      console.log("SHOP DESC PRESENT", head?.includes('name="description"'));
    }
    if (route === "/product/orbit-runner-01") {
      console.log("PRODUCT OG RAW", JSON.stringify(head?.match(/<meta property="og:title"[^>]*>/)?.[0]));
      console.log("TITLE CODES", title && [...title].map((c) => c.codePointAt(0).toString(16)).join(" "));
    }
  }
})();
