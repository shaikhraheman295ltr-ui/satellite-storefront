"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart, subtotal } from "@/store/cart";
import { formatINR } from "@/lib/format";

export default function CartDrawer() {
  const { items, open, toggleOpen, setQty, remove } = useCart();
  const total = subtotal(items);
  const asideRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) toggleOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, toggleOpen]);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => closeRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    lastFocus.current?.focus?.();
    return undefined;
  }, [open]);

  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !open) return;
    const nodes = asideRef.current?.querySelectorAll<HTMLElement>(
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

  useEffect(() => {
    const lenis = (window as any).__lenis;
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-[120] overflow-hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        onClick={() => toggleOpen(false)}
        className={`absolute inset-0 bg-ink/60 transition-opacity duration-150 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onKeyDown={trapFocus}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l-2 border-ink bg-bg text-ink transition-transform duration-300 ease-snap ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b-2 border-ink px-4 py-4">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em]">
            CART [{String(items.reduce((n, x) => n + x.qty, 0)).padStart(2, "0")}]
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => toggleOpen(false)}
            className="border-2 border-ink px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-ink hover:text-bg"
          >
            CLOSE [X]
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="font-display text-7xl leading-none">0</div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-grey2">
              NOTHING IN THE BAG YET.
            </p>
            <Link
              href="/shop"
              onClick={() => toggleOpen(false)}
              className="btn-brut mt-2"
            >
              BROWSE FOOTWEAR →
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y-2 divide-ink/10 overflow-y-auto">
              {items.map((it) => (
                <li key={`${it.slug}-${it.size}`} className="flex gap-3 p-4">
                  <div className="relative h-24 w-20 shrink-0 border-2 border-ink bg-grey1">
                    <Image src={it.image} alt={it.name} fill sizes="80px" className="object-cover object-bottom" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/product/${it.slug}`} onClick={() => toggleOpen(false)} className="font-display text-sm uppercase leading-tight hover:text-accent">
                          {it.name}
                        </Link>
                        <span className="font-mono text-[10px] text-grey2">{it.index}</span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-grey2">
                        SIZE EU {it.size} / QTY
                      </p>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex border-2 border-ink">
                        <button
                          type="button"
                          onClick={() => setQty(it.slug, it.size, it.qty - 1)}
                          className="h-7 w-7 font-mono text-sm hover:bg-ink hover:text-bg"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="flex h-7 w-8 items-center justify-center border-x-2 border-ink font-mono text-xs">
                          {it.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(it.slug, it.size, it.qty + 1)}
                          className="h-7 w-7 font-mono text-sm hover:bg-ink hover:text-bg"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">{formatINR(it.price * it.qty)}</div>
                        <button
                          type="button"
                          onClick={() => remove(it.slug, it.size)}
                          className="font-mono text-[9px] uppercase tracking-[0.15em] text-grey2 underline underline-offset-2 hover:text-accent"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t-2 border-ink p-4">
              <dl className="space-y-2 font-mono text-[11px] uppercase tracking-[0.15em]">
                <div className="flex justify-between">
                  <dt className="text-grey2">SUBTOTAL</dt>
                  <dd>{formatINR(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-grey2">SHIPPING</dt>
                  <dd className="text-accent">FREE / IN</dd>
                </div>
                <div className="flex justify-between border-t-2 border-ink pt-2 text-sm">
                  <dt>TOTAL</dt>
                  <dd>{formatINR(total)}</dd>
                </div>
              </dl>
              <Link
                href="/checkout"
                onClick={() => toggleOpen(false)}
                className="btn-brut btn-brut-accent mt-4 w-full"
              >
                CHECKOUT → RAZORPAY
              </Link>
              <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.15em] text-grey2">
                GST INCLUDED · 14-DAY RETURNS · SECURE PAYMENT
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
