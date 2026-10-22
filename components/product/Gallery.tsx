"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/data/products";

export default function Gallery({ product }: { product: Product }) {
  const [i, setI] = useState(0);
  const g = product.gallery[i] ?? product.gallery[0];

  return (
    <div>
      <div className="relative aspect-[4/5] border-2 border-ink bg-grey1">
        <Image
          src={g.src}
          alt={`${product.name} — view ${i + 1}`}
          fill
          priority={i === 0}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="object-cover object-bottom"
        />
        <span className="absolute left-3 top-3 border border-ink bg-bg px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em]">
          IMG {String(i + 1).padStart(2, "0")} / {String(product.gallery.length).padStart(2, "0")}
        </span>
        <span className="absolute bottom-3 right-3 bg-ink px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-bg">
          {product.id} / {product.index}
        </span>
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Product images">
        {product.gallery.map((im, idx) => (
          <button
            key={im.src + idx}
            type="button"
            onClick={() => setI(idx)}
            aria-pressed={i === idx}
            aria-label={`View image ${idx + 1} of ${product.gallery.length}`}
            className={`relative h-20 w-16 shrink-0 border-2 bg-grey1 ${
              i === idx ? "border-accent" : "border-ink"
            }`}
          >
            <Image src={im.src} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
