"use client";

import FrameSequence, { type Chapter } from "@/components/FrameSequence";
import { sequences } from "@/lib/sequences.config";

const chapters: Chapter[] = [
  {
    from: 1,
    to: 42,
    node: (
      <div className="flex h-full flex-col justify-between px-4 pb-8 pt-28 md:px-6 md:pb-10">
        <div className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white sm:flex-row sm:items-start sm:justify-between">
          <span>02 / CRAFT — PROCESS FILM</span>
          <span>ATELIER 01 — AURANGABAD</span>
        </div>
        <div className="max-w-4xl ">
          <h2 className="display-xl film-type text-white">
            CUT.
            <br />
            LASTED.
            <br />
            STITCHED<span className="text-accent">.</span>
          </h2>
          <p className="mt-5 max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-white/80">
            SIX HOURS PER PAIR. NO SHORTCUTS. THE MACHINE ONLY DOES WHAT THE HAND
            ALREADY DECIDED.
          </p>
        </div>
      </div>
    ),
  },
  {
    from: 43,
    to: 114,
    node: (
      <div className="flex h-full items-end px-4 pb-8 pt-28 md:px-6 md:pb-10">
        <div className="grid w-full grid-cols-2 gap-3 border-t-2 border-white/50 pt-4 md:grid-cols-4 md:gap-6">
          {[
            ["01", "CLICK", "DIE-CUT SUEDE PANELS"],
            ["02", "LAST", "6-HOUR HAND LASTING"],
            ["03", "STITCH", "8 STITCHES PER INCH"],
            ["04", "CURE", "48 HOURS, NO HEAT"],
          ].map(([n, t, d]) => (
            <div key={n} className="font-mono text-[10px] uppercase tracking-[0.16em] text-white">
              <div className="text-white/50">{n}</div>
              <div className="mt-1 text-sm">{t}</div>
              <div className="mt-1 text-white/60">{d}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    from: 115,
    to: 150,
    node: (
      <div className="flex h-full flex-col items-end justify-end px-4 pb-8 pt-28 text-right md:px-6 md:pb-10">
        <div className="">
          <h3 className="display-lg film-type text-white">
            HONEST
            <br />
            TO THE
            <br />
            GLUE<span className="text-accent">.</span>
          </h3>
          <p className="mt-3 max-w-xs font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-white/70">
            NOTHING IS HIDDEN IN THE CONSTRUCTION. OPEN A PAIR AND COUNT THE
            STEPS.
          </p>
        </div>
      </div>
    ),
  },
];

export default function Craft() {
  return (
    <section aria-label="Craft — making of the sneaker" className="relative border-t-2 border-ink">
      <FrameSequence
        cfg={sequences.craft}
        pinVH={3.4}
        hold={70}
        chapters={chapters}
      />
    </section>
  );
}
