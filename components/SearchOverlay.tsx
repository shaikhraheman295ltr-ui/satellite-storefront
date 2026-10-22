"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { products } from "@/data/products";
import { useUI } from "@/store/ui";
import { formatINR } from "@/lib/format";

export default function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const toggleSearch = useUI((s) => s.toggleSearch);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products.slice(0, 4);
    return products.filter((p) =>
      [p.name, p.category, p.colorway, p.id, p.slug].join(" ").toLowerCase().includes(term)
    );
  }, [q]);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement | null;
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 40);
      (window as any).__lenis?.stop();
    } else {
      (window as any).__lenis?.start();
      lastFocus.current?.focus?.();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, toggleSearch]);

  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const nodes = rootRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    );
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[130] flex flex-col bg-bg text-ink"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
      onKeyDown={trapFocus}
    >
      <div className="flex items-center justify-between border-b-2 border-ink px-4 py-3 font-mono text-[10px] uppercase tracking-[0.25em]">
        <span>SEARCH / INDEX</span>
        <button
          type="button"
          onClick={() => toggleSearch(false)}
          className="border-2 border-ink px-2 py-1 hover:bg-ink hover:text-bg"
        >
          CLOSE [ESC]
        </button>
      </div>

      <div className="border-b-2 border-ink px-4 pb-4 pt-6 md:px-6">
        <label htmlFor="search-input" className="meta">QUERY</label>
        <input
          ref={inputRef}
          id="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) {
              toggleSearch(false);
              router.push(`/product/${results[0].slug}`);
            }
          }}
          placeholder="RUNNER, SUEDE, OBSIDIAN…"
          className="mt-2 w-full border-b-2 border-ink bg-transparent pb-2 font-display text-[10vw] uppercase leading-none tracking-[-0.03em] placeholder:text-grey1 focus:outline-none md:text-[6vw]"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
          <p className="meta mb-4">
            {results.length} RESULT{results.length === 1 ? "" : "S"} / {q ? `“${q}”` : "RECENT + FEATURED"}
          </p>
          {results.length === 0 ? (
            <p className="font-display text-4xl uppercase">NOTHING FOUND. TRY “RUNNER”.</p>
          ) : (
            <ul className="grid gap-px border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-4">
              {results.map((p) => (
                <li key={p.slug} className="border-b-2 border-r-2 border-ink bg-bg">
                  <Link
                    href={`/product/${p.slug}`}
                    onClick={() => toggleSearch(false)}
                    className="group flex gap-3 p-3"
                  >
                    <div className="relative h-24 w-20 shrink-0 border border-ink bg-grey1">
                      <Image src={p.gallery[0].src} alt={p.name} fill sizes="80px" className="object-cover object-bottom transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="flex min-w-0 flex-col justify-between">
                      <div>
                        <div className="font-display text-xs uppercase leading-tight">{p.name}</div>
                        <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-grey2">
                          {p.category} / {p.colorway}
                        </div>
                      </div>
                      <div className="font-mono text-xs">{formatINR(p.price)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t-2 border-ink px-4 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-grey2 md:px-6">
        ESC TO CLOSE / ENTER TO OPEN FIRST RESULT
      </div>
    </div>
  );
}
