"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useCart } from "@/store/cart";

export default function ProductPanel({ product }: { product: Product }) {
  const [size, setSize] = useState<number | null>(null);
  const [err, setErr] = useState(false);
  const [guide, setGuide] = useState(false);
  const add = useCart((s) => s.add);
  const wish = useCart((s) => s.wish);
  const toggleWish = useCart((s) => s.toggleWish);
  const wished = wish.includes(product.slug);

  const onAdd = () => {
    if (!size) {
      setErr(true);
      return;
    }
    setErr(false);
    add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      size,
      index: product.index,
      image: product.gallery[0].src,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b-2 border-ink pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-grey2">
        <span>{product.id} / {product.drop}</span>
        <span>{product.category}</span>
      </div>

      <h1 className="display-lg mt-4">{product.name}</h1>
      <div className="mt-2 flex items-baseline gap-4">
        <span className="font-mono text-lg">{formatINR(product.price)}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-grey2">
          INCL. GST / {product.colorway}
        </span>
      </div>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-grey2">{product.short}</p>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="meta !text-ink">SELECT SIZE / EU</h2>
          <button
            type="button"
            onClick={() => setGuide((v) => !v)}
            aria-expanded={guide}
            aria-controls="size-guide"
            className="font-mono text-[9px] uppercase tracking-[0.15em] text-grey2 underline underline-offset-2 hover:text-accent"
          >
            SIZE GUIDE
          </button>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1 border-t-2 border-ink pt-2 sm:grid-cols-6">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setSize(s); setErr(false); }}
              aria-pressed={size === s}
              className={`border-2 py-2 font-mono text-xs transition-colors ${
                size === s
                  ? "border-ink bg-ink text-bg"
                  : "border-ink/25 hover:border-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {err && (
          <p role="alert" className="mt-2 border-2 border-accent px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-accent">
            SELECT A SIZE FIRST.
          </p>
        )}
        {guide && (
          <div id="size-guide" className="mt-3 border border-ink/20 p-3">
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 font-mono text-[9px] uppercase tracking-[0.12em] sm:grid-cols-4">
              {[
                [40, "25.5"],
                [41, "26.2"],
                [42, "27.0"],
                [43, "27.8"],
                [44, "28.5"],
                [45, "29.2"],
                [46, "30.0"],
              ].map(([eu, cm]) => (
                <div key={eu} className="flex justify-between border-b border-ink/10 py-1">
                  <span className="text-grey2">EU {eu}</span>
                  <span>{cm} CM</span>
                </div>
              ))}
            </div>
            <p className="mt-2 font-mono text-[8px] uppercase leading-relaxed tracking-[0.12em] text-grey2">
              MEASURE YOUR FOOT IN CM. BETWEEN SIZES? TAKE THE LARGER — THE LAST RUNS SLIM.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onAdd} className="btn-brut btn-brut-accent flex-1">
          ADD TO CART + {size ? `EU ${size}` : ""}
        </button>
        <button
          type="button"
          onClick={() => toggleWish(product.slug)}
          aria-pressed={wished}
          className={`border-2 border-ink px-4 font-mono text-sm ${
            wished ? "bg-accent text-bg" : "hover:bg-ink hover:text-bg"
          }`}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        >
          {wished ? "✦" : "♡"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-grey2">
        <span className="border border-ink/20 px-2 py-1">SHIPS IN 24H / IN</span>
        <span className="border border-ink/20 px-2 py-1">14-DAY RETURNS</span>
        <span className="border border-ink/20 px-2 py-1">400 PAIRS ONLY</span>
        <span className="border border-ink/20 px-2 py-1">COD AVAILABLE</span>
      </div>

      <div className="mt-8 border-t-2 border-ink">
        <details open className="group border-b border-ink/20">
          <summary className="flex cursor-pointer items-center justify-between py-3 font-mono text-[10px] uppercase tracking-[0.2em]">
            THE STORY
            <span className="text-accent group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="pb-4 text-sm leading-relaxed text-grey2">{product.story}</p>
        </details>
        <details className="group border-b border-ink/20">
          <summary className="flex cursor-pointer items-center justify-between py-3 font-mono text-[10px] uppercase tracking-[0.2em]">
            SPECS / MATERIALS
            <span className="text-accent group-open:rotate-45 transition-transform">+</span>
          </summary>
          <dl className="pb-4">
            {product.specs.map((s) => (
              <div key={s.k} className="flex justify-between gap-4 border-b border-ink/10 py-2 font-mono text-[10px] uppercase tracking-[0.12em]">
                <dt className="text-grey2">{s.k}</dt>
                <dd className="text-right">{s.v}</dd>
              </div>
            ))}
          </dl>
        </details>
        <details className="group border-b border-ink/20">
          <summary className="flex cursor-pointer items-center justify-between py-3 font-mono text-[10px] uppercase tracking-[0.2em]">
            SHIPPING / RETURNS
            <span className="text-accent group-open:rotate-45 transition-transform">+</span>
          </summary>
          <p className="pb-4 text-sm leading-relaxed text-grey2">
            Dispatched from Mumbai within 24 hours. Free shipping across India,
            ₹1,200 flat worldwide. Unworn pairs can be returned within 14 days —
            the box must come back the way it left.
          </p>
        </details>
      </div>

      <p className="mt-6 font-mono text-[9px] uppercase leading-relaxed tracking-[0.15em] text-grey2">
        NEED HELP? <Link href="/contact" className="text-ink underline underline-offset-2 hover:text-accent">TALK TO THE STUDIO →</Link>
      </p>
    </div>
  );
}
