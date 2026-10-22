# SATELLITE® — Scroll-Driven Footwear Store

Minimal × brutalist e-commerce build for a sneaker studio, with five canvas
frame-sequence sections (the v1 hero/CTA scroll films plus three idle autoplay
loops) and a full storefront (shop, product, cart, saved items, checkout, about,
contact, 404).

```
Next.js 15 (App Router) · TypeScript · Tailwind · Zustand · Lenis
Canvas frame playback (WebP) · GSAP available for future accents
```

## Quick start

```bash
npm install
# create .env.local from .env.example and set NEXT_PUBLIC_SITE_URL
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the build
```

`NEXT_PUBLIC_SITE_URL` is the single source for canonical URLs, Open Graph
URLs, the sitemap and the robots sitemap line. It must be the final HTTPS origin
with no trailing slash. The code falls back to
`https://satellite.example.com` so local builds work, but that fallback must
never ship to a public deployment.

> **Windows / OneDrive note:** this project sits inside OneDrive. Large native
> binaries in `node_modules` can occasionally sync truncated. If `next build`
> reports `@next/swc-win32-x64-msvc … is not a valid Win32 application`,
> reinstall that package or run `npm install` outside OneDrive. The project does
> not depend on OneDrive at runtime after build.

## Folder map

```
frames/                  ORIGINAL JPGs — never renamed or altered
  2.1/ 150   720×1280   craft sequence
  2.2/ 150   720×1280   details sequence
  2.3/ 213   736×414    collection sequence (1–10 & 202–213 are black → trimmed)
  v1/  247   1280×720   hero sequence (also used for the CTA tail 218–247)
images/                  ORIGINAL product stills + hero-poster.jpg
public/frames/           generated WebP copies, renumbered f0001…fNNNN
  <seq>/m/               half-resolution copies for mobile
public/images/           generated WebP stills
app/                     routes (home, shop, product, checkout, about, contact, wishlist)
components/              FrameSequence engine, Cursor, Reveal + UI
components/home/         hero, craft, details, collection, cta, manifesto
data/products.ts         catalog + image mapping
data/site.ts             brand, contact, manifesto copy
lib/sequences.config.ts  sequence → section mapping + autoplay exclusions
lib/frames.ts            lazy decode cache, stride, release
store/cart.ts            persistent cart + saved/wishlist (localStorage)
store/ui.ts              autoplay, search, sound state
ASSET_REPORT.md          full scan of the source assets
```

## How the sequence engine works

`components/FrameSequence.tsx` is the single reusable player used by all five
sections (`start`/`end` let the CTA reuse v1 frames 218–247 without extra data).

- Frames render to `<canvas>` — cover-fit, DPR-capped, redrawn only when the
  rounded frame index changes.
- **Loader** (`lib/frames.ts`) fetches the first 10% immediately, then queues the
  rest at idle. Mobile uses `public/frames/<seq>/m` plus every 2nd frame
  (`stride = 2`).
- **Viewport gating**: sections more than ~1.5 viewports away call
  `releaseSequence()`; the cache is keyed by folder so hero + CTA share one copy.
- **Autoplay policy**: the `v1` folder is the only folder excluded from the
  new continuous auto-loop. Hero and CTA keep their original one-shot
  intro-to-hold and scroll-scrub behaviour, so v1 never enters the idle loop.
  `2.1`, `2.2` and `2.3` autoplay continuously at `fps` once the page has been
  still for 850 ms. Scrolling scrubs; stopping resumes the loop. The collection
  also pauses on hover. Use the `AUTO` toggle to disable/enable looping.
- **Enforced exclusion**: `lib/sequences.config.ts` exports
  `AUTO_LOOP_EXCLUDED_FOLDERS = ["/frames/v1"]` and
  `isAutoLoopExcluded()`. The prefix check also catches mobile
  `/frames/v1/m`. `FrameSequence` derives `autoLoopEnabled` from that helper,
  so a caller cannot accidentally turn looping on for v1. Every other
  sequence folder defaults to autoplay; pass `autoLoop={false}` only for a
  deliberate non-looping instance.
- **Reduced motion**: looping, autoplay, the custom cursor, reveals, marquee,
  parallax and smooth scroll are disabled; scrubbing stays user-controlled.
  The `AUTO` state is switched off when reduced motion is detected.
- **Scroll reveals**: `components/Reveal.tsx` uses one IntersectionObserver per
  element and CSS transitions. Hidden state is applied only after JS runs, so
  no-JS and reduced-motion visitors see all content.
- **Cursor**: `components/Cursor.tsx` replaces the native cursor with a
  crosshair on fine-pointer devices. Native I-beams stay on form fields;
  touch/coarse pointers and reduced-motion users keep the system cursor.
- Per-section loader chip shows the decode percentage; the poster (first frame)
  is drawn until real frames arrive. The collection banner omits the chip so it
  never covers the SHOP link.

### Swap or add frames

1. Drop new folders in `frames/<name>/` (any JPG/PNG numbering).
2. Regenerate WebP copies (adjust the Python one-liner used originally, or add a
   small script) into `public/frames/<name>/f0001.webp…`.
3. Register it in `lib/sequences.config.ts`:

```ts
mySeq: {
  label: "06 / SOMETHING",
  place: "Where it sits in the story",
  folder: "/frames/mySeq",
  frames: 180,
  width: 1280, height: 720,
  fps: 24,
  mobileFolder: "/frames/mySeq/m",
  poster: "/frames/mySeq/f0001.webp",
}
```

4. Use it: `<FrameSequence cfg={sequences.mySeq} pinVH={3} chapters={[…]} />`.
   New folders autoplay by default. Pass `autoLoop={false}` only if a specific
   section must stay scroll-only; `/frames/v1` is always excluded.

Renumbering must be contiguous (`f0001…fNNNN`) because the loader builds URLs by
index. Originals in `frames/` may keep any naming.

## Edit products

`data/products.ts` holds everything the store renders: price (INR), sizes,
colorways, specs, gallery, copy. Image entries use generated stills:

```ts
gallery: [{ src: "/images/12.webp", w: 736, h: 920 }, …]
```

Add a product → it appears in shop, search, related items and gets a statically
generated page (`generateStaticParams`). Update `index` for the brutalist number
chip.

## Cart, checkout, payments

- Zustand cart persists to `localStorage` (`sh-cart-v1`), including the saved
  list. Hearts appear in `/wishlist` and in the header `SAVED [nn]` counter.
- Shop quick-add opens an explicit EU size picker; it never silently adds a
  default size.
- Checkout is a single page with address + Razorpay/COD placeholders and a demo
  confirmation. Placing a demo order clears the cart and moves focus to the
  confirmation heading. Wire real payments via `lib/payments.ts`
  (`createRazorpayOrder`, `toMinorUnits`) and an `/api/razorpay/order` route.
- Add keys to `.env.local`:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

Never expose the secret client-side.

## Design system

Tokens live in `app/globals.css` as hex + RGB triplets (so Tailwind supports
`ink/20`-style alpha). Type: Archivo Black (display), Space Grotesk (body),
JetBrains Mono (metadata) — three families, maximum three weights. Borders are
2–3px, radius is globally `0`, shadows are hard offsets only, accent is used on
less than 5% of any screen.

## Performance notes

- Original masters: 760 JPG (20.2 MB). Generated: ~20 MB WebP desktop +
  ~7 MB mobile variants; stills ~1.6 MB.
- Only near-viewport sequences stay decoded; mobile runs every 2nd frame at half
  resolution.
- Canvas draws only on frame change; `next/image` handles stills with AVIF/WebP.
- Images below the fold are lazy by default; hero poster is the LCP asset.

## Accessibility

- Semantic landmarks, skip link, visible 3px accent focus rings.
- All interactive controls are real `<button>`/`<a>`/`<input>` elements with
  labels/aria state; chapter overlays are hidden from AT until visible.
- Cart drawer, search overlay and mobile menu are modal dialogs with focus
  traps, Escape-to-close and focus restoration to the trigger. The cart is
  `inert` while closed.
- Contrast targets AA with `--ink` on `--bg`; accent used for emphasis only.
- `prefers-reduced-motion` removes autoplay, marquee animation, parallax, smooth
  scroll and cursor replacement, and switches `AUTO` to OFF.
- Shop filters collapse behind a single FILTERS + SORT control below `lg`; the
  collection film autoloops on touch, and hover pauses it on fine pointers.
- Contact, newsletter and checkout success states receive focus and use a live
  region where appropriate; the size picker is an explicit button group with
  Escape-to-close and focus restoration.

## QA

The scripts in the repo root were used for visual and behavioural QA against
`http://localhost:3000` (Playwright-core driving Microsoft Edge headless):

```bash
node qa.cjs          # section positions, hero scrub 34 → 244, frame states
node qa-pages.cjs    # shop → PDP → cart → checkout, search, a11y audit
node qa-mobile.cjs   # 390×844 full-page pass, overflow + responsive checks
node qa-focus.cjs    # mobile filters, collection scrub, reduced motion
node qa-menu.cjs     # menu focus trap, Escape, focus restore, hover playback
node qa-prod.cjs     # smoke test against the production build (next start)
node qa-live.cjs     # post-fix end-to-end checks (autoplay, picker, focus, overflow)
node qa-recheck.cjs  # focused recheck: 768px overflow, mobile loop, v1 scrub
node qa-final.cjs    # wishlist, reveals, cursor context, v1 wheel
node qa-details.cjs  # details sequence desktop + mobile
node qa-health.cjs   # full route/security/SEO/flows/responsive read-only audit
```

Outputs land in `qa/` as PNGs and JSON. The newest results are in
`qa/live.json`, `qa/recheck.json` and `qa/final.json`; the full write-up is in
`QA_FIX_REPORT.md`.

## Known demo gaps

- Set `NEXT_PUBLIC_SITE_URL` to the real production origin before indexing. The
  fallback in `data/site.ts` is `https://satellite.example.com`, and the social
  links still point to generic `instagram.com` / `x.com` / `youtube.com`
  profiles. Replace the links and configure the domain before launch.
- Checkout is intentionally a demo: no order is persisted server-side and no
  payment is charged. The Razorpay integration points are placeholders.
- Automated QA covers Chromium/Edge (desktop and emulated mobile). Safari/iOS
  and Firefox still need a real-device pass, especially canvas decode memory
  and Lenis touch behaviour.
- Product and film imagery is third-party placeholder material and is not
  cleared for commercial use (see below).

## Asset licensing — placeholder imagery

The SATELLITE brand, catalogue, copy, prices and product models are fictional.
The supplied **source footage and stills are third-party stock/campaign assets**
and contain visible third-party marks and watermarks (including New Balance,
Nike, UGG, Adidas, Puma, fiverr and Arabic ad copy). They are used here as
layout placeholders only. Replace every original in `frames/` and `images/`
(and regenerate `public/frames`, `public/images`, the poster and OG art with
cleared assets) before any commercial launch. Do not ship the current masters
as-is.

## Deploy

Vercel: import the repo, framework preset Next.js, build `npm run build`. Set
`NEXT_PUBLIC_SITE_URL` to the production HTTPS origin before launch so canonical,
Open Graph, sitemap and robots URLs are correct. HSTS is sent automatically only
when that value starts with `https://`.
