"use client";

import Link from "next/link";
import FrameSequence, { type Chapter } from "@/components/FrameSequence";
import { sequences } from "@/lib/sequences.config";

const chapters: Chapter[] = [
  {
    from: 1,
    to: 36,
    node: (
      <div className="flex h-full flex-col justify-between px-4 pb-6 pt-28 md:px-6 md:pb-8 md:pt-32">
        <div className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white sm:flex-row sm:items-start sm:justify-between">
          <span>SS26 — DROP 04</span>
          <span>MUMBAI 19.0760°N / 72.8777°E</span>
        </div>
        <div className="">
          <h1 className="display-xl film-type text-white">
            BUILT
            <br />
            FROM
            <br />
            MOTION<span className="text-accent">.</span>
          </h1>
          <div className="mt-5 flex flex-col gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white sm:flex-row sm:items-center sm:gap-6">
            <span>PHANTOM RUNNER GT — OBSIDIAN</span>
            <span className="hidden h-[2px] w-16 bg-white sm:block" />
            <span>FRAME SEQUENCE 01 / 05</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    from: 37,
    to: 118,
    node: (
      <div className="flex h-full items-end justify-between px-4 pb-8 pt-28 md:px-6 md:pb-10">
        <div className="max-w-md border-l-2 border-white pl-4 ">
          {[
            ["01", "SUEDE SHELL", "FULL-GRAIN, 1.8 MM"],
            ["02", "CUP SOLE", "INJECTED PHYLON, 42 MM"],
            ["03", "ROPE LACE", "CONTRAST BONE, 6 MM"],
          ].map(([n, t, s]) => (
            <div key={n} className="mb-4 border-b border-white/30 pb-3 last:mb-0">
              <div className="flex items-baseline justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white">
                <span>{n} / {t}</span>
                <span className="text-white/60">{s}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-white  [writing-mode:vertical-rl] md:block">
          WEAR TEST — 002 / CONTINUOUS
        </div>
      </div>
    ),
  },
  {
    from: 119,
    to: 160,
    node: (
      <div className="flex h-full flex-col justify-between px-4 pb-8 pt-28 md:px-6 md:pb-10">
        <div className="flex justify-end">
          <div className="max-w-xl text-right ">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white">
              MATERIAL STUDY / SECTION 02
            </p>
            <h2 className="display-lg film-type mt-3 text-white">
              NOTHING
              <br />
              SOFT ABOUT
              <br />
              THE QUIET.
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t-2 border-white/40 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white  sm:flex-row sm:justify-between">
          <span>MATTE TPU / SUEDE / RIPSTOP</span>
          <span>PANTONE 19-4005 TCX</span>
          <span>STITCH DENSITY 8 SPI</span>
        </div>
      </div>
    ),
  },
  {
    from: 161,
    to: 246,
    node: (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-4 pb-10 pt-28">
        <div className="text-center ">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white">
            DROP 04 — LIMITED TO 400 PAIRS
          </p>
          <h2 className="display-lg film-type mt-3 text-white">
            TAKE THE
            <br />
            FIRST STEP.
          </h2>
        </div>
        <Link href="/shop" className="btn-brut btn-brut-accent pointer-events-auto bg-bg text-ink">
          SHOP THE COLLECTION →
        </Link>
      </div>
    ),
  },
];

export default function Hero() {
  return (
    <section aria-label="Hero — Phantom Runner GT">
      <FrameSequence
        cfg={sequences.hero}
        pinVH={4.2}
        hold={34}
        scrollHint
        chapters={chapters}
      />
    </section>
  );
}
