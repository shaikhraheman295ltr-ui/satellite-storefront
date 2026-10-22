"use client";

import Link from "next/link";
import FrameSequence from "@/components/FrameSequence";
import { sequences } from "@/lib/sequences.config";

export default function Cta() {
  return (
    <section aria-labelledby="cta-title" className="border-t-2 border-ink bg-invertbg">
      <FrameSequence
        cfg={sequences.cta}
        start={218}
        end={247}
        pinVH={2.3}
        hold={20}
        inverted
        chapters={[
          {
            from: 1,
            to: 30,
            node: (
              <div className="flex h-full flex-col justify-between px-4 pb-8 pt-28 text-invertink md:px-6 md:pb-10">
                <div className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white sm:flex-row sm:items-start sm:justify-between">
                  <span>05 / FINAL CALL</span>
                  <span>FRAME 218 → 247</span>
                </div>
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                  <div className="">
                    <h2 id="cta-title" className="display-xl film-type text-white">
                      MOVE
                      <br />
                      OR BE
                      <br />
                      MOVED<span className="text-accent">.</span>
                    </h2>
                    <p className="mt-4 max-w-sm font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                      DROP 04 IS LIVE. 400 PAIRS. NO RESTOCK. NO APOLOGY.
                    </p>
                  </div>
                  <Link href="/shop" className="btn-brut btn-brut-accent pointer-events-auto bg-bg text-ink">
                    SHOP NOW →
                  </Link>
                </div>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}
