"use client";

import { useEffect, useRef } from "react";

/** Subtle image parallax, capped at 8% of the element height. */
export default function Parallax({
  children,
  strength = 0.08,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const el = ref.current!;
    let raf = 0;
    const loop = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      const clamped = Math.max(-1, Math.min(1, p));
      el.style.transform = `translate3d(0, ${(-clamped * strength * 100).toFixed(2)}%, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [strength]);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={ref} className="h-[112%] w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
