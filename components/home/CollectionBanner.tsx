"use client";

import Link from "next/link";
import FrameSequence from "@/components/FrameSequence";
import { sequences } from "@/lib/sequences.config";

export default function CollectionBanner() {
  return (
    <section aria-labelledby="collection-title" className="border-t-2 border-ink bg-bg">
      <div className="mx-auto max-w-[1600px] px-4 pt-12 md:px-6 md:pt-16">
        <div className="flex flex-col justify-between gap-4 border-b-2 border-ink pb-4 md:flex-row md:items-end">
          <div>
            <span className="section-index">04 / COLLECTION</span>
            <h2 id="collection-title" className="display-lg mt-3">
              RUN THE
              <br />
              CITY<span className="text-accent">.</span>
            </h2>
          </div>
          <div className="max-w-xs md:text-right">
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-grey2">
              FIFTEEN SILHOUETTES. FOUR HUNDRED PAIRS EACH. WHEN THEY’RE GONE THE
              MOULD IS DESTROYED.
            </p>
            <Link href="/shop" className="btn-brut mt-4">
              ALL FOOTWEAR →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[1600px] px-4 pb-4 md:px-6">
        <div className="relative border-2 border-ink">
          <FrameSequence
            cfg={sequences.collection}
            mode="hover"
            playOnHover
            loadingChip={false}
            hud={false}
            className="bg-invertbg"
          >
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-4">
              <div className="flex items-start justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-white md:text-[10px]">
                <span>LOOP FILM — 736×414</span>
                <span className="border border-white/50 px-2 py-1">
                  <span className="hidden md:inline">AUTO-LOOP / HOVER TO PAUSE</span>
                  <span className="md:hidden">AUTO-LOOP</span>
                </span>
              </div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/80 md:text-[10px]">
                    COLLECTION FILM / 04
                  </p>
                  <p className="mt-2 hidden max-w-md font-display text-xl uppercase leading-none text-white sm:block md:text-3xl">
                    GREYSCALE ON PURPOSE. COLOR IS A DECISION, NOT A DEFAULT.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="pointer-events-auto btn-brut btn-brut-accent shrink-0 bg-bg px-4 py-2 text-[11px] text-ink md:px-6 md:py-3 md:text-xs"
                >
                  SHOP →
                </Link>
              </div>
            </div>
          </FrameSequence>
        </div>
        <div className="flex justify-between border-x-2 border-b-2 border-ink px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-grey2">
          <span>AUTO-LOOPS WHEN IDLE / SCROLL TO SCRUB</span>
          <span className="hidden sm:inline">HOVER PAUSES / 24 FPS</span>
          <span className="sm:hidden">24 FPS / NO AUDIO</span>
        </div>
      </div>
    </section>
  );
}
