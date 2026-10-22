"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** milliseconds — useful for staggering cards */
  delay?: number;
  variant?: "up" | "left" | "right" | "fade";
};

/**
 * Lightweight IntersectionObserver reveal. There is deliberately no hidden
 * class in the server markup: if JS is unavailable, the content is visible.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    el.dataset.reveal = variant;
    el.style.setProperty("--reveal-delay", `${delay}ms`);

    // Already in (or near) the first viewport at mount — show immediately,
    // don't hide and re-animate content the visitor is already reading.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      el.classList.add("reveal", "is-visible");
      return;
    }

    el.classList.add("reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, variant]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
