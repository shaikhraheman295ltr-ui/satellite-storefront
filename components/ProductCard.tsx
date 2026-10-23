"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useCart } from "@/store/cart";

export default function ProductCard({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const sizePicker = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const add = useCart((s) => s.add);
  const wish = useCart((s) => s.wish);
  const toggleWish = useCart((s) => s.toggleWish);
  const wished = wish.includes(product.slug);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPickerOpen(false);
      addButton.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        sizePicker.current?.contains(target) ||
        addButton.current?.contains(target)
      ) {
        return;
      }
      setPickerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [pickerOpen]);

  const addSize = (size: number) => {
    add({
      slug: product.slug,
      name: product.name,
      price: product.price,
      size,
      index: product.index,
      image: product.gallery[0].src,
    });
    setPickerOpen(false);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = inner.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
  };
  const onLeave = () => {
    if (inner.current) inner.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <article className={`group relative flex h-full flex-col border-2 border-ink bg-bg ${className}`}>
      <div
        ref={inner}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative aspect-[4/5] overflow-hidden border-b-2 border-ink bg-grey1 transition-transform duration-200 ease-out"
      >
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`} />
        <Image
          src={product.gallery[0].src}
          alt={`${product.name} — ${product.colorway}`}
          fill
          sizes="(max-width: 768px) 80vw, 30vw"
          className="object-cover object-bottom origin-bottom transition-transform duration-500 ease-snap group-hover:scale-[1.03]"
        />
        <span className="absolute left-2 top-2 z-20 border border-ink bg-bg px-1.5 py-0.5 font-mono text-[9px] tracking-[0.15em]">
          {product.index}
        </span>
        <button
          type="button"
          onClick={() => toggleWish(product.slug)}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center border border-ink font-mono text-xs transition-colors ${
            wished ? "bg-accent text-bg" : "bg-bg text-ink hover:bg-ink hover:text-bg"
          }`}
        >
          {wished ? "✦" : "+"}
        </button>
        <span className="absolute bottom-2 right-2 z-20 font-mono text-[9px] uppercase tracking-[0.18em] text-ink/60">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 p-3">
        <div>
          <h3 className="font-display text-sm uppercase leading-tight tracking-[-0.01em] md:text-base">
            <Link href={`/product/${product.slug}`} className="hover:text-accent">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-grey2">
            {product.colorway}
          </p>
        </div>
        <div className="relative flex items-end justify-between gap-2 border-t border-ink/15 pt-2">
          <span className="font-mono text-xs">{formatINR(product.price)}</span>
          <button
            ref={addButton}
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            aria-controls={`size-picker-${product.slug}`}
            aria-label={`Add ${product.name} to cart — choose a size`}
            className="border-2 border-ink px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] hover:bg-ink hover:text-bg"
          >
            ADD +
          </button>

          {pickerOpen && (
            <div
              ref={sizePicker}
              id={`size-picker-${product.slug}`}
              role="group"
              aria-label={`Choose a size for ${product.name}`}
              className="absolute bottom-full right-0 z-30 mb-2 w-36 border-2 border-ink bg-bg p-2 shadow-[4px_4px_0_var(--ink)]"
            >
              <div className="flex items-center justify-between gap-2 pb-1">
                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-grey2">
                  SELECT EU
                </span>
                <button
                  type="button"
                  onClick={() => setPickerOpen(false)}
                  aria-label="Close size picker"
                  className="px-1 font-mono text-xs leading-none hover:text-accent"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSize(s)}
                    aria-label={`Add EU ${s} to cart`}
                    className="border border-ink py-1 font-mono text-[10px] hover:bg-ink hover:text-bg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
