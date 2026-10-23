"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart, cartCount } from "@/store/cart";
import { useUI } from "@/store/ui";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

export default function Navbar() {
  const items = useCart((s) => s.items);
  const wish = useCart((s) => s.wish);
  const toggleOpen = useCart((s) => s.toggleOpen);
  const autoplay = useUI((s) => s.autoplay);
  const toggleAutoplay = useUI((s) => s.toggleAutoplay);
  const toggleSearch = useUI((s) => s.toggleSearch);
  const [menu, setMenu] = useState(false);
  const motionChecked = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const lastMenuFocus = useRef<HTMLElement | null>(null);
  const n = cartCount(items);

  useEffect(() => {
    if (motionChecked.current) return;
    motionChecked.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      toggleAutoplay(false);
    }
  }, [toggleAutoplay]);

  useEffect(() => {
    if (!menu) return;
    lastMenuFocus.current = document.activeElement as HTMLElement | null;
    (window as any).__lenis?.stop();
    lockScroll();
    const t = setTimeout(() => menuCloseRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      unlockScroll();
      (window as any).__lenis?.start();
      lastMenuFocus.current?.focus?.();
    };
  }, [menu]);

  const trapMenu = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const nodes = menuRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[210] -translate-y-24 border-2 border-ink bg-bg px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-[100] bg-ink pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] text-invertink">
        <div className="flex h-14 items-center justify-between border-b border-white/15 px-4 md:h-16 md:px-6">
          <Link href="/" className="group flex items-baseline gap-2" aria-label="SATELLITE home">
            <span className="font-display text-lg uppercase leading-none tracking-[-0.04em] md:text-xl">
              SATELLITE
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] opacity-60">®</span>
          </Link>

          <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.22em] md:flex" aria-label="Primary">
            <Link href="/shop" className="hover:text-accent">Shop</Link>
            <Link href="/about" className="hover:text-accent">Studio</Link>
            <Link href="/contact" className="hover:text-accent">Contact</Link>
          </nav>

          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] md:gap-5">
            <button
              type="button"
              onClick={() => toggleAutoplay()}
              aria-pressed={autoplay}
              className="hidden items-center gap-2 sm:flex"
              title="Toggle autoplay on all scroll sequences"
            >
              <span className={`h-2 w-2 ${autoplay ? "bg-accent" : "bg-white/30"}`} />
              AUTO:{autoplay ? "ON" : "OFF"}
            </button>
            <button type="button" onClick={() => toggleSearch(true)} className="hover:text-accent" aria-label="Open search">
              SEARCH
            </button>
            <Link
              href="/wishlist"
              className="hidden hover:text-accent sm:inline"
              aria-label={`SAVED [${String(wish.length).padStart(2, "0")}], ${wish.length} saved items`}
            >
              SAVED [{String(wish.length).padStart(2, "0")}]
            </Link>
            <button
              type="button"
              onClick={() => toggleOpen(true)}
              className="border border-white/40 px-2 py-1 hover:bg-invertink hover:text-ink"
              aria-label={`CART [${String(n).padStart(2, "0")}], open cart with ${n} items`}
            >
              CART [{String(n).padStart(2, "0")}]
            </button>
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMenu(true)}
              aria-expanded={menu}
              aria-label="Open menu"
            >
              MENU
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onKeyDown={trapMenu}
          className="fixed inset-0 z-[150] flex flex-col bg-ink pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] pt-[calc(1rem+env(safe-area-inset-top))] text-invertink"
        >
          <div className="flex items-center justify-between border-b-2 border-invertink/25 pb-3 font-mono text-[10px] uppercase tracking-[0.2em]">
            <span>SATELLITE® — INDEX</span>
            <button
              ref={menuCloseRef}
              type="button"
              onClick={() => setMenu(false)}
              aria-label="Close menu"
            >
              CLOSE [X]
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-3" aria-label="Mobile">
            {[
              ["/shop", "SHOP"],
              ["/about", "STUDIO"],
              ["/contact", "CONTACT"],
              ["/wishlist", `SAVED [${wish.length}]`],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenu(false)}
                className="display-lg border-b border-invertink/15 pb-2 hover:text-accent"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
            <button
              type="button"
              onClick={() => toggleAutoplay()}
              className="flex items-center gap-2"
              aria-pressed={autoplay}
            >
              <span className={`h-2 w-2 ${autoplay ? "bg-accent" : "bg-white/30"}`} />
              AUTOPLAY:{autoplay ? "ON" : "OFF"}
            </button>
            <span>MUMBAI — IST</span>
          </div>
        </div>
      )}
    </>
  );
}
