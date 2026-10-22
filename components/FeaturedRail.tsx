"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

export default function FeaturedRail() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const list = products.slice(0, 6);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    const loop = () => {
      const el = wrap.current;
      const tr = track.current;
      if (el && tr) {
        const r = el.getBoundingClientRect();
        const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
        const p = Math.min(1, Math.max(0, -r.top / scrollable));
        const max = Math.max(0, tr.scrollWidth - window.innerWidth + 32);
        tr.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`;
        if (progress.current) progress.current.textContent = `${String(Math.round(p * 100)).padStart(3, "0")}%`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section aria-labelledby="featured-title" className="border-t-2 border-ink bg-bg">
      <div ref={wrap} className="relative h-[220vh] md:h-[280vh]">
        <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden py-16">
          <div className="mb-6 flex items-end justify-between border-b-2 border-ink px-4 pb-4 md:px-6">
            <div>
              <span className="section-index">SELECTED / 04</span>
              <h2 id="featured-title" className="display-lg mt-3">
                THE CURRENT
                <br />
                RUN<span className="text-accent">.</span>
              </h2>
            </div>
            <div className="hidden text-right md:block">
              <span className="meta">SCROLL TO PAN</span>
              <div className="mt-2 font-mono text-4xl tracking-tight">
                <span ref={progress}>000%</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden px-4 md:px-6">
            <div ref={track} className="flex w-max gap-3 will-change-transform md:gap-4">
              {list.map((p) => (
                <div key={p.slug} className="w-[74vw] shrink-0 sm:w-[48vw] md:w-[32vw] lg:w-[26vw]">
                  <ProductCard product={p} />
                </div>
              ))}
              <Link
                href="/shop"
                className="flex w-[60vw] shrink-0 flex-col justify-between border-2 border-ink bg-ink p-4 text-invertink sm:w-[32vw] md:w-[22vw]"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-invertink/50">
                  INDEX 08 / 08
                </span>
                <span className="display-lg">
                  ALL
                  <br />
                  FOOT
                  <br />
                  WEAR
                  <span className="text-accent">→</span>
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-6 flex justify-between px-4 font-mono text-[9px] uppercase tracking-[0.2em] text-grey2 md:px-6">
            <span>06 OF 08 SILHOUETTES SHOWN</span>
            <span>DROP 04 — SS26</span>
          </div>
        </div>
      </div>
    </section>
  );
}
