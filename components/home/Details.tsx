"use client";

import FrameSequence from "@/components/FrameSequence";
import { sequences } from "@/lib/sequences.config";

const specs = [
  ["UPPER", "OIL-PULL SUEDE / 1.8 MM"],
  ["PANELS", "13, HAND-CUT"],
  ["SOLE", "DUAL-DENSITY, 42 MM"],
  ["LACES", "SPECKLED ROPE, 6 MM"],
  ["WEIGHT", "392 G / EU 42"],
  ["ORIGIN", "AURANGABAD, IN"],
];

export default function Details() {
  return (
    <section aria-labelledby="details-title" className="border-t-2 border-ink bg-bg">
      <div className="relative grid md:grid-cols-2">
        <div className="relative border-b-2 border-ink md:border-b-0 md:border-r-2">
          <FrameSequence
            cfg={sequences.details}
            pinVH={3}
            hold={64}
            className="border-0"
            canvasClassName=""
          />
          <div className="pointer-events-none absolute left-4 top-28 z-10 hidden border border-white/40 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white md:block">
            IN USE — STUDIO 402
          </div>
        </div>

        <div className="flex flex-col justify-center px-4 py-12 md:sticky md:top-0 md:h-[100svh] md:px-10 md:py-24">
          <div className="mb-6 flex items-center justify-between border-b-2 border-ink pb-3">
            <span className="section-index">03 / DETAILS</span>
            <span className="meta">ZOOM LEVEL 200%</span>
          </div>
          <h2 id="details-title" className="display-lg">
            THE CLOSE
            <br />
            READ<span className="text-accent">.</span>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-grey2">
            Every decision is visible if you know where to look. The suede is
            cut so the nap runs downhill; the eyelets are stamped, not glued;
            the laces are speckled because the yarn is a factory offcut.
          </p>

          <dl className="mt-8 border-t-2 border-ink">
            {specs.map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-3 font-mono text-[10px] uppercase tracking-[0.16em]"
              >
                <dt className="text-grey2">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-12 w-12 border-2 border-ink bg-accent" aria-hidden="true" />
            <p className="max-w-[16rem] font-mono text-[9px] uppercase leading-relaxed tracking-[0.16em] text-grey2">
              SIGNAL ORANGE — USED ON &lt;5% OF ANY SCREEN. THE ONLY COLOR WE
              ALLOW OURSELVES.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
