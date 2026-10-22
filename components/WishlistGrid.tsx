"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { products } from "@/data/products";
import { useCart } from "@/store/cart";

export default function WishlistGrid() {
  const wish = useCart((s) => s.wish);
  const saved = products.filter((p) => wish.includes(p.slug));

  if (saved.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-start gap-4 border-2 border-ink p-6 md:p-10">
        <span className="font-display text-7xl leading-none text-accent" aria-hidden="true">
          ♡
        </span>
        <p className="display-lg">
          NOTHING
          <br />
          SAVED.
        </p>
        <p className="max-w-md font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-grey2">
          TAP THE HEART ON ANY PAIR TO KEEP IT HERE. SAVES STAY ON THIS DEVICE.
        </p>
        <Link href="/shop" className="btn-brut btn-brut-accent">
          BROWSE FOOTWEAR →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {saved.map((p, i) => (
        <Reveal key={p.slug} delay={(i % 4) * 70} className="h-full">
          <ProductCard product={p} className="h-full" />
        </Reveal>
      ))}
    </div>
  );
}
