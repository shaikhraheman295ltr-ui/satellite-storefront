"use client";

import { useEffect, useState } from "react";

/** 000 → 100 counter, then a hard wipe. Runs once per session. */
export default function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || sessionStorage.getItem("sh-pre") === "1") {
      setHidden(true);
      return;
    }
    sessionStorage.setItem("sh-pre", "1");
    const start = performance.now();
    const dur = 350;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setHidden(true), 700);
    return () => clearTimeout(t);
  }, [done]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[300] flex flex-col justify-between bg-ink p-5 text-invertink transition-transform duration-500 ease-snap md:p-8 ${
        done ? "-translate-y-full" : "translate-y-0"
      }`}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.25em]">
        <span>SATELLITE / FOOTWEAR</span>
        <span>LOADING ASSETS</span>
      </div>
      <div className="display-xl leading-none">
        {String(count).padStart(3, "0")}
        <span className="text-accent">.</span>
      </div>
      <div className="flex items-end justify-between font-mono text-[10px] uppercase tracking-[0.25em]">
        <span>EST. 2021 — MUMBAI</span>
        <span>{count === 100 ? "READY" : "DECODING FRAMES"}</span>
      </div>
    </div>
  );
}
