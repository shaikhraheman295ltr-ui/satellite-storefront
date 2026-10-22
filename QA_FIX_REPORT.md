# SATELLITE® — QA / Fix Report

**Environment:** Next.js 15.5.28 (App Router), React 19, TypeScript, Tailwind, Zustand, Lenis, canvas frame player  
**Target:** `http://localhost:3000` (production build served by `next start`)  
**Browser coverage:** Chromium / Microsoft Edge headless. Safari/iOS and Firefox were not available.  
**Final automated runs:** `qa/health.json`, `qa/lighthouse-home.json`, `qa/lighthouse-shop.json`, `qa/lighthouse-product.json`, `qa/lighthouse-checkout.json`, `qa/lighthouse-404.json`; earlier regression artifacts: `qa/live.json`, `qa/recheck.json`, `qa/final.json`, `qa/prod.json`

---

## 1. Current autoplay policy (latest requirement)

The only folder excluded from the new continuous auto-loop is:

```
public/frames/v1
```

Its original one-shot intro-to-hold and scroll-scrub behaviour is intentionally left unchanged. The exclusion is enforced in one central place, not by remembering to omit a prop at each call site:

```ts
// lib/sequences.config.ts
export const AUTO_LOOP_EXCLUDED_FOLDERS = ["/frames/v1"] as const;

export const isAutoLoopExcluded = (folder: string) =>
  AUTO_LOOP_EXCLUDED_FOLDERS.some(
    (excluded) => folder === excluded || folder.startsWith(`${excluded}/`)
  );
```

```tsx
// components/FrameSequence.tsx
const folder = isMobile && cfg.mobileFolder ? cfg.mobileFolder : cfg.folder;

// The folder exclusion wins. Pass autoLoop={false} to disable a non-v1
// instance; nothing can force v1 to loop.
const autoLoopEnabled =
  !isAutoLoopExcluded(folder) && (autoLoop ?? true);
```

Why the prefix check matters: `hero` uses `/frames/v1`, `cta` uses `/frames/v1`, and mobile uses `/frames/v1/m`. All three return `true` from `isAutoLoopExcluded()`.

### What each sequence does now

| Folder | Section | Behaviour |
| --- | --- | --- |
| `/frames/v1` | Hero | Excluded. Original play-to-hold + scroll scrub, no continuous loop. |
| `/frames/v1` | CTA tail 218–247 | Excluded. Original play-to-hold + scroll scrub. |
| `/frames/2.1` | Craft | Autoplays while in view after 850 ms of page stillness; scrolling scrubs; resumes when still. |
| `/frames/2.2` | Details | Same idle autoplay behaviour. |
| `/frames/2.3` | Collection | Same, plus hover pauses on fine-pointer devices. |

The canvas engine is not a `<video>` element, so browser video autoplay policies do not apply. No audio is used. The global `AUTO` toggle defaults on; `prefers-reduced-motion` turns looping off as an accessibility exception.

---

## 2. Severity-ranked findings and fixes

### CRITICAL / launch blockers (not code-fixable in this pass)

1. **Third-party trademarks and watermarks in source imagery**
   - **Files:** `frames/`, `images/`, generated `public/frames/`, `public/images/`
   - **Root cause:** supplied campaign/stock imagery contains visible New Balance, Nike, UGG, Adidas, Puma, fiverr and Arabic ad marks.
   - **Status:** unresolved by design. Assets were left untouched per requirement.
   - **Required action:** replace with cleared photography and regenerate `public/frames`, `public/images`, the poster and OG image before commercial launch.

2. **Placeholder production identity**
   - **File:** `data/site.ts`, `components/Footer.tsx`
   - **Root cause:** `site.domain` is `https://satellite.example.com`; social links point to generic Instagram/X/YouTube roots.
   - **Impact:** canonical, JSON-LD, sitemap and OG URLs point at a non-owned domain; social buttons have no brand destination.
   - **Status:** documented in README. Replace the domain and social URLs before indexing or launch.

### MAJOR — fixed

3. **Short collection film never autoplayed on mobile**
   - **Symptom:** at 390 px the collection `data-frame` stayed at 172; desktop looped normally.
   - **Root cause:** `loopEligible` reused the full-stage hero `inView` test, which required `rect.bottom > 50vh`. The mobile collection frame is only ~199 px tall, so it was visible without satisfying that test.
   - **Files:** `components/FrameSequence.tsx`
   - **Fix:** added a dedicated viewport-intersection test for autoplay:

```tsx
const loopInView = rect.bottom > vh * 0.1 && rect.top < vh * 0.9;
const loopEligible =
  autoLoopEnabled && autoplayOn && !reduced && loopInView && !dipS.interacted;
```

   - **Verification:** mobile collection advanced `2 → 34`; desktop `24 → 56`.

4. **Shop quick-add silently added EU 44**
   - **Symptom:** clicking `ADD +` added a mid-list size without asking.
   - **Root cause:** `product.sizes[Math.floor(product.sizes.length / 2)]` was used as an implicit default.
   - **Files:** `components/ProductCard.tsx`
   - **Fix:** `ADD +` now opens an explicit `SELECT EU` group. A cart item is only created when the shopper selects a size. Escape closes the picker and returns focus to the trigger; outside click closes it.
   - **Verification:** no cart item after opening/Escape; selecting `41` stored exactly one item with `size: 41`.

5. **Wishlist was a dead end**
   - **Symptom:** hearts persisted, but there was no page/filter/drawer to view saved products.
   - **Files added:** `app/wishlist/page.tsx`, `components/WishlistGrid.tsx`
   - **Files updated:** `components/Navbar.tsx`, `components/Footer.tsx`
   - **Fix:** header `SAVED [nn]` counter, mobile-menu and footer links, `/wishlist` grid, remove-heart and empty state. Saved items are `noindex`.
   - **Verification:** save one product → `/wishlist` shows one card and header `SAVED [01]`; remove → `SAVED [00]`, empty state visible, 320 px overflow 0.

6. **Checkout kept the cart after placing an order**
   - **Symptom:** success screen shown, cart still populated.
   - **Files:** `store/cart.ts`, `app/checkout/page.tsx`
   - **Fix:** added `clear()` and called it after `setPlaced(id)`. Confirmation `<h1>` is focusable and receives focus.
   - **Verification:** after submit: `items: []`, `localStorage` `{"items":[],"wish":[]}`, active element `H1`, heading “YOU MOVED.”

7. **About `<h1>` overflowed at 320 / 360 px**
   - **Root cause:** `.display-xl` minimum was `3.5rem`; the word did not fit the 288 px content area.
   - **Files:** `app/globals.css`, `app/about/page.tsx`
   - **Fix:** lowered the clamp minimum to `2.9rem` and wrapped the lower About sections in `Reveal`.
   - **Verification:** 320 and 360 pages: `scrollWidth === innerWidth`, overflow 0; h1 rect within padding.

8. **2 px horizontal overflow at 768 px**
   - **Root cause:** footer social links were a non-wrapping 120 px row inside an ~87 px `md:col-span-2` column; the last YT chip reached `770.3px`.
   - **Files:** `components/Footer.tsx`
   - **Fix:** `flex flex-wrap gap-2` instead of `flex gap-3`.
   - **Verification:** `/`, `/about`, `/shop` at 768 now `scrollWidth 768`, overflow 0.

### MINOR — fixed

9. **Crosshair CSS could hide the cursor with no replacement below 768 px**
   - **Root cause:** native cursor hiding applied to every fine pointer, but the visual `.crosshair-cursor` had `hidden md:block`.
   - **Files:** `components/Cursor.tsx`
   - **Fix:** removed `hidden md:block`; a fine pointer at any width gets the crosshair, while touch/reduced-motion users never get the class. The native cursor also stays visible until the first real pointer move.
   - **Verification:** before moving: native `auto`, crosshair opacity 0; after moving: root class true, crosshair opacity 1. 700 px fine pointer → crosshair block/opacity 1; 390 px touch → root class absent, body cursor `auto`.

10. **Cart drawer could contribute horizontal overflow**
    - **Files:** `components/CartDrawer.tsx`
    - **Fix:** added `overflow-hidden` to the fixed outer drawer wrapper.

11. **Success states dropped focus to `<body>`**
    - **Files:** `components/ContactForm.tsx`, `components/home/Newsletter.tsx`, `app/checkout/page.tsx`
    - **Fix:** focusable confirmation elements (`tabIndex={-1}`), `role="status"` / `aria-live="polite"` on contact/newsletter, focus in `useEffect`.
    - **Verification:** active element had `role="status"` after contact and newsletter submit; active element was the confirmation `H1` after checkout.

12. **No scroll reveals**
    - **Files added:** `components/Reveal.tsx`; **CSS:** `app/globals.css`
    - **Applied:** Manifesto columns, shop product cards, About lower sections.
    - **Fix:** one `IntersectionObserver` per wrapper; hidden state is added only after JS runs; reduced motion and no-JS see content.
    - **Verification:** Manifesto wrappers `opacity 1`, `transform none`, `is-visible` after scrolling; shop first card opacity 1.

13. **Frame playback / “video” diagnosis**
    - There are **no `<video>` elements** in the project. All motion is canvas playback of WebP frame folders.
    - Non-rendering symptoms came from lazy loading/poster fallback, mobile stride, and the gating bug above—not 404s or codec support.
    - Canvas uses cover-fit, DPR-capped sizing and redraws only when the rounded frame changes. Verified 1440×900 hero canvas and 718×900 / 390×844 details canvas have non-zero intrinsic sizes and advancing frames.

---

## 3. Exact central code changes

### `lib/sequences.config.ts`

```diff
+export const AUTO_LOOP_EXCLUDED_FOLDERS = ["/frames/v1"] as const;
+
+export const isAutoLoopExcluded = (folder: string) =>
+  AUTO_LOOP_EXCLUDED_FOLDERS.some(
+    (excluded) => folder === excluded || folder.startsWith(`${excluded}/`)
+  );
```

### `components/FrameSequence.tsx`

```diff
-  autoLoop = false,
+  autoLoop,
```

```diff
+    const autoLoopEnabled =
+      !isAutoLoopExcluded(folder) && (autoLoop ?? true);
```

```diff
-        const loopEligible =
-          autoLoopEnabled && autoplayOn && !reduced && inView && !dipS.interacted;
+        const loopInView = rect.bottom > vh * 0.1 && rect.top < vh * 0.9;
+        const loopEligible =
+          autoLoopEnabled && autoplayOn && !reduced && loopInView && !dipS.interacted;
```

The v1 path still uses the original play-to-hold logic and scroll hand-off. The non-v1 loop starts from the frame on screen, advances at `cfg.fps`, wraps with a hard cut at the seam, and pauses on scroll or collection hover.

### Crosshair / reveals

- `components/Cursor.tsx` — global custom crosshair, fine pointers only.
- `components/Reveal.tsx` — reusable `IntersectionObserver` reveal.
- `app/globals.css` — `.crosshair-*`, `.reveal`, reduced-motion rules.
- `app/layout.tsx` — `<Cursor />` mounted globally.

### Shop size picker

`components/ProductCard.tsx` now renders a `role="group"` size chooser with `aria-expanded` on `ADD +`; each size button calls `addSize(size)`.

### Cart / checkout

`store/cart.ts` now exposes:

```ts
clear: () => {
  set({ items: [] });
  get().persist();
},
```

`app/checkout/page.tsx` calls `clear()` after placing the demo order and focuses the confirmation heading.

---

## 4. Verification steps

Automated:

```bash
npx tsc --noEmit
npx next build
npm start

node qa-live.cjs       # end-to-end autoplay, picker, focus, overflow
node qa-recheck.cjs    # 768 px, mobile loop, v1 scrub, narrow cursor
node qa-final.cjs      # wishlist, reveals, cursor context, v1 wheel
node qa-details.cjs    # details sequence desktop + mobile
node qa-prod.cjs       # production smoke: PDP, search, cart
```

Requested results:

- `consoleErrors: []` and `badResponses: []` in `qa/live.json` and `qa/final.json`.
- Craft autoplay `20 → 56`; details `21 → 59` desktop / `21 → 58` mobile; collection `24 → 56` desktop / `2 → 34` mobile.
- Collection hover paused at 57 for 1.1 s, then resumed to 87.
- v1 hero/CTA stayed stable after their hold frame; v1 wheel test after 1.8 s and 1.6 s later: `138 → 138`.
- 320 / 360 / 768 px overflow 0 on home, About and Shop.
- Checkout cart cleared and confirmation focused; contact/newsletter success focused.
- Wishlist save/remove/count/empty state and mobile menu link all pass.
- Turning `AUTO` off set `aria-pressed="false"` and stopped the craft loop (`1 → 1`).
- Canvas and reveal checks pass.

Manual spot checks still recommended:

- Real iOS Safari touch scrolling and canvas memory over a full home pass.
- Firefox rendering of `mix-blend-mode` crosshair and `backdrop`/border styles.
- Slow-network first load: poster-to-frame handoff and loader chip.
- Full keyboard pass through the new size picker and wishlist route.

---

## 5. Remaining gaps

- **Safari/iOS and Firefox not tested** (no browser available in this environment).
- **Third-party imagery is unlicensed** — launch blocker.
- **Domain and social URLs are placeholders** — fix before indexing.
- **Checkout is a demo** — no server order, no confirmation email, no real Razorpay charge.
- **No `<video>` elements** — if the brief expects actual video files, that is a separate implementation; the current system is canvas/WebP by design.

No original files in `frames/` or `images/` were renamed or modified.

---

## 6. Full health check — 22 October 2026

**Target:** `http://localhost:3000` (production build, `next start`)
**Build:** Next.js 15.5.28, App Router; `npx tsc --noEmit` clean; `next build` clean; `/shop` is static (`○`).
**Automated evidence:** `qa/health.json`, `qa/lighthouse-home.json`, `qa/lighthouse-shop.json`, `qa/lighthouse-product.json`, `qa/lighthouse-checkout.json`, `qa/lighthouse-404.json`
**Browser:** Chromium / Microsoft Edge headless only. Firefox, Safari and iOS were not available.

### 6.1 Summary

| Check | Result |
|---|---|
| Routes checked | 17 |
| HTTP 200 | 15 |
| Expected 404s (custom 404 + invalid product) | 2 |
| HTTP 5xx responses | 0 |
| Page-level JavaScript errors | 0 |
| Failed network requests | 0 |
| Unexpected bad responses | 0 |
| Console messages | 2, both expected `Failed to load resource ... 404` messages caused by the two intentional 404 navigations |
| Image URLs checked (src + srcset + CSS) | 720 |
| Broken images | 0 |
| Internal links checked | 17 |
| Non-200 internal links | 0 |
| Responsive checks (7 routes × 6 widths, 320–1440 px) | 42 |
| Horizontal-overflow failures | 0 |
| Sensitive-file paths returning 404 | 12 |
| Sitemap URLs | 12 |
| Sitemap URLs returning non-200 | 0 |
| Sitemap entries for `/checkout` | 0 |
| Lighthouse pages audited | 5 (home, shop, PDP, checkout, 404) |
| Lighthouse accessibility / best practices / SEO | `1.0 / 1.0 / 1.0` on all 5 |
| Lighthouse failures | 0 |
| HTML fetch response times | 3–21 ms locally |
| `npm audit` | 9 vulnerabilities: 6 high, 3 moderate, 0 critical (production-only: 1 high nested PostCSS via Next, 1 moderate Next) |

The two console messages are the browser reporting the intentionally requested 404 document itself; `flows.consoleErrors` is empty, and no asset, image or API request failed.

### 6.2 Issue ledger

| ID | Severity | Area | Finding | Status |
|---|---|---|---|---|
| SEO-01 | High | Metadata | No canonical URL on any route. | Fixed in `lib/seo.ts`; route-specific canonical on home, shop, about, contact, checkout, wishlist and PDP. |
| SEO-02 | High | Metadata | Child routes inherited the home page Open Graph/Twitter title and image. | Fixed: complete per-route OG/Twitter metadata via `pageMetadata()`. |
| SEO-03 | High | Metadata | `/shop` was dynamic because of `searchParams`; metadata was streamed and absent from initial HTML. | Fixed: `/shop` is static; `ShopQuerySync` applies `?c=` client-side. |
| SEO-04 | High | Indexing | Invalid product URLs returned `robots: index, follow`. | Fixed: invalid product metadata and the custom 404 are `noindex`. |
| SEO-05 | Medium | Indexing | The custom 404 inherited the home page `<title>`. | Fixed: custom 404 title/description/noindex. |
| SEO-06 | Medium | Sitemap | `/checkout` was in the sitemap while also disallowed and `noindex`. | Fixed: removed from `app/sitemap.ts`. |
| SEO-07 | High | Domain | Canonical/OG/sitemap domain was hardcoded to `satellite.example.com`. | Fixed in code via `NEXT_PUBLIC_SITE_URL`; production value still required. |
| SEC-01 | High | Headers | No clickjacking, MIME-sniffing, referrer, permissions or framing policy; `X-Powered-By` leaked. | Fixed in `next.config.js`; HSTS is emitted only for an HTTPS `NEXT_PUBLIC_SITE_URL`. |
| A11Y-01 | High | Contrast | Secondary text failed WCAG AA in many places (27 Lighthouse nodes). | Fixed: `--grey-2` darkened to `#5f5c56`; footer and 404 secondary text raised to `/55`. |
| A11Y-02 | Medium | Accessible names | Header SAVED/CART accessible names did not contain their visible text. | Fixed: labels now include `SAVED [nn]` / `CART [nn]`. |
| A11Y-03 | Medium | Heading order | Mobile shop skipped from `h1` to product `h3`. | Fixed: hidden `h2` “Products” added before the grid. |
| VIS-01 | High | Product media | Product cards used a fixed 4:5 frame with centre cropping, so tall editorial photos lost their bottom edge (soles, shadows and lower composition). | Fixed: bottom-anchored image crop (`object-bottom`, bottom-origin hover scale) in cards, PDP gallery, related rail, and search/cart/checkout thumbnails. |
| OPS-01 | Low | Legacy asset | `/favicon.ico` returns 404. | Accepted: `/icon.svg` is linked and valid; modern browsers use it. Add a legacy ICO only if required. |
| DEP-01 | High | Dependencies | 9 audit findings: 6 high, 3 moderate; production-only exposure is a nested PostCSS high and Next moderate. | Open/manual: remediation requires `next@16` (and Tailwind 4 for dev findings), a major upgrade. |
| ENV-01 | High | Transport | No HTTPS endpoint locally, so HSTS/TLS cannot be verified end to end. | Manual: deploy behind HTTPS and set `NEXT_PUBLIC_SITE_URL=https://…`; HSTS logic is implemented and tested. |
| FUNC-01 | High | Backend | Checkout, contact and newsletter are demo/client-only; no order API, payment capture, email delivery or database. | Manual launch gate: wire before accepting real orders. |
| BRAND-01 | High | Content | Contact details and social links are placeholders. | Manual launch gate: replace with real studio destinations. |
| LEGAL-01 | Critical | Content/licensing | Supplied imagery contains third-party trademarks/watermarks and has no licence confirmation. | Manual launch blocker: replace or license before commercial use. |
| QA-01 | Medium | Cross-browser | Firefox, Safari and iOS were not tested. | Manual: run the documented checks on real hardware. |

**Counts:** 12 issues fixed and verified, 1 low issue accepted, 6 manual launch/environment items. Severity: 1 critical, 12 high, 5 medium, 1 low.

### 6.3 Fix details

- **Canonical/OG/Twitter metadata:** new `lib/seo.ts` builds `title`, `description`, `alternates.canonical`, full `openGraph`, `twitter` and optional robots for every route. Applied to `app/page.tsx`, `app/shop/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/checkout/layout.tsx`, `app/wishlist/page.tsx` and `app/product/[slug]/page.tsx`.
- **Static shop with query filter:** removed `searchParams` from the server page, added `components/shop/ShopQuerySync.tsx`, moved `shopCategory` into `store/ui.ts`, and made `components/shop/ShopGrid.tsx` read it. Verified `/shop?c=RUNNER`, `/shop?c=LOAFER` and footer navigation all update the filter while canonical stays `/shop`.
- **404/noindex/sitemap:** custom `app/not-found.tsx` metadata, invalid-product `noindex`, and `app/sitemap.ts` now contains the 12 indexable URLs only.
- **Domain config:** `data/site.ts` reads `NEXT_PUBLIC_SITE_URL`; `.env.example` and `README.md` document the production requirement and the placeholder fallback.
- **Security headers:** `next.config.js` sends `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Permitted-Cross-Domain-Policies`, a framing/base/object CSP, and conditionally `Strict-Transport-Security`; `poweredByHeader` is off.
- **Accessibility:** `app/globals.css` contrast token, `components/Footer.tsx` secondary text, `components/Navbar.tsx` accessible names, `components/shop/ShopGrid.tsx` heading order, and `app/not-found.tsx` footer contrast.
- **QA reproducibility:** `qa-health.cjs` and `qa-meta.cjs` accept `QA_BASE`; `NEXT_DIST_DIR` supports non-disruptive builds; `.next-qa` is ignored and excluded from TypeScript input.
- No frame or image source files were renamed, moved or edited.

### 6.4 Verification evidence

- `npx tsc --noEmit` → clean.
- `npx next build` → 20/20 static pages generated; `/shop` shown as static.
- Live `:3000` route, link, image, responsive, security and flow checks → all pass as summarized above.
- Canonicals: `http://localhost:3000` (home), `http://localhost:3000/shop`, `http://localhost:3000/product/orbit-runner-01`, etc.
- Raw `/shop` HTML now contains the shop description, canonical, OG and Twitter tags.
- `/does-not-exist` → `404`, title `404 — Page Not Found — SATELLITE®`, `robots: noindex`.
- `/product/does-not-exist` → `404`, `robots: noindex`.
- `/checkout` and `/wishlist` are `noindex`; neither appears in the sitemap.
- `robots.txt` disallows `/checkout`; sitemap lists 12 URLs, all 200.
- Response headers: security headers present, `X-Powered-By` absent, gzip enabled. HSTS absent on local HTTP by design; loading `next.config.js` with an HTTPS origin produces `max-age=31536000; includeSubDomains`.
- Flows: search (3 results, Enter opens PDP), explicit size picker, add to cart, wishlist save/count/route, demo checkout (cart cleared, confirmation focused), contact and newsletter success focus.

### 6.5 Prevention

- Make `qa-health.cjs` plus the five Lighthouse reports a release gate; fail on any 5xx, missing canonical, broken image/link, overflow, `X-Powered-By`, missing security header, or sitemap/noindex contradiction.
- Require `pageMetadata()` for every new indexable route so canonical and social metadata cannot drift.
- Validate `NEXT_PUBLIC_SITE_URL` at deployment (HTTPS origin, no trailing slash, not `satellite.example.com`); fail a production build when it is missing.
- Keep `/checkout` out of the sitemap and keep the `noindex`/robots pair aligned; add an automated assertion for both.
- Add `axe`/Lighthouse CI and retain contrast tokens; avoid one-off grey values.
- Add an image-crop regression: assert product media uses bottom-anchored cropping at 390 px and 1440 px, and inspect the bottom edge of the tallest galleries.
- Schedule dependency work as a separate Next 16 / Tailwind 4 upgrade with regression checks; do not mix it with content releases.
- Keep the v1 autoplay exclusion central in `AUTO_LOOP_EXCLUDED_FOLDERS`; all non-v1 folders remain auto-looping.
- Before commercial launch: replace unlicensed imagery, set real contact/social destinations, connect a real order/payment/email backend, and run Safari/iOS and Firefox checks.

### 6.6 Follow-up: product media crop

**Reported:** product images in the shop grid were cut off at the bottom.

**Root cause:** `ProductCard` uses a fixed `aspect-[4/5]` media box with `object-cover`. The editorial source images range from 0.56:1 to 0.82:1; taller images were cropped at both top and bottom, and the default centre position made the missing bottom edge conspicuous.

**Fix:** bottom-anchor the crop instead of centre-cropping it:

- `components/ProductCard.tsx` — `object-cover object-bottom origin-bottom`; hover scale now grows from the bottom edge.
- `components/product/Gallery.tsx` — main PDP image uses `object-bottom`.
- `app/product/[slug]/page.tsx` — related-product images use `object-bottom`.
- `components/SearchOverlay.tsx`, `components/CartDrawer.tsx`, `app/checkout/page.tsx` — product thumbnails use `object-bottom`.

**Verified:** computed `object-position` is `50% 100%` on every shop-card image, the PDP main image and related images. Screenshots at 1440 px (`qa/media-after-card-hollow.png`) and 390 px (`qa/shop-media-after-390.png`, `qa/pdp-media-after.png`) show the soles, shadows and lower composition intact; no horizontal overflow was introduced. `npx tsc --noEmit` and the production build pass, and the live `:3000` server is serving the updated build.


