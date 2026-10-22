"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { categories, products } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useUI } from "@/store/ui";

type Sort = "FEATURED" | "PRICE ↑" | "PRICE ↓" | "A–Z";

export default function ShopGrid() {
  const cat = useUI((s) => s.shopCategory);
  const setCat = useUI((s) => s.setShopCategory);
  const [max, setMax] = useState(12000);
  const [sort, setSort] = useState<Sort>("FEATURED");
  const [size, setSize] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters =
    Number(!!cat) + Number(max < 12000) + Number(size !== null) + Number(sort !== "FEATURED");

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        p.price <= max &&
        (size === null || p.sizes.includes(size))
    );
    if (sort === "PRICE ↑") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "PRICE ↓") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "A–Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "FEATURED")
      list = [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return list;
  }, [cat, max, sort, size]);

  const reset = () => {
    setCat("");
    setMax(12000);
    setSort("FEATURED");
    setSize(null);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
        aria-controls="shop-filters"
        className="mb-4 flex w-full items-center justify-between border-2 border-ink px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] lg:hidden"
      >
        <span>{filtersOpen ? "HIDE FILTERS" : "FILTERS + SORT"}{activeFilters ? ` [${activeFilters}]` : ""}</span>
        <span className="text-grey2">{filtered.length} RESULTS</span>
      </button>
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside
        id="shop-filters"
        className={`${filtersOpen ? "" : "hidden"} h-max border-2 border-ink bg-bg lg:sticky lg:top-20 lg:block`}
        aria-label="Filters"
      >
        <div className="flex items-center justify-between border-b-2 border-ink px-3 py-2">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.24em]">FILTERS</h2>
          <button type="button" onClick={reset} className="font-mono text-[9px] uppercase tracking-[0.15em] text-grey2 underline underline-offset-2 hover:text-accent">
            RESET
          </button>
        </div>

        <div className="border-b-2 border-ink p-3">
          <h3 className="meta mb-2">CATEGORY</h3>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setCat("")}
              aria-pressed={cat === ""}
              className={`flex w-full justify-between border border-ink px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                cat === "" ? "bg-ink text-bg" : "hover:bg-grey1"
              }`}
            >
              <span>ALL</span>
              <span>{products.length}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                aria-pressed={cat === c}
                className={`flex w-full justify-between border border-ink px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  cat === c ? "bg-ink text-bg" : "hover:bg-grey1"
                }`}
              >
                <span>{c}</span>
                <span>{products.filter((p) => p.category === c).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-b-2 border-ink p-3">
          <h3 className="meta mb-2">MAX PRICE</h3>
          <input
            type="range"
            min={5000}
            max={12000}
            step={500}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="h-1 w-full appearance-none bg-ink accent-[#FF3B00]"
            aria-label="Maximum price"
          />
          <div className="mt-2 flex justify-between font-mono text-[10px] tracking-[0.1em]">
            <span>₹5,000</span>
            <span className="text-accent">{formatINR(max)}</span>
          </div>
        </div>

        <div className="border-b-2 border-ink p-3">
          <h3 className="meta mb-2">SIZE / EU</h3>
          <div className="grid grid-cols-4 gap-1">
            {[40, 41, 42, 43, 44, 45, 46].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(size === s ? null : s)}
                aria-pressed={size === s}
                className={`border border-ink py-1.5 font-mono text-[10px] ${
                  size === s ? "bg-accent text-bg" : "hover:bg-grey1"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3">
          <h3 className="meta mb-2">SORT</h3>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="w-full border-2 border-ink bg-bg px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em] focus:outline-none"
            aria-label="Sort products"
          >
            {(["FEATURED", "PRICE ↑", "PRICE ↓", "A–Z"] as Sort[]).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </aside>

      <div>
        <h2 className="sr-only">Products</h2>
        <div className="mb-3 flex items-center justify-between border-b-2 border-ink pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-grey2">
          <span>{filtered.length} RESULTS / DROP 04</span>
          <span className="hidden sm:block">HOVER FOR DETAIL / CLICK TO ENTER</span>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-start gap-4 border-2 border-ink p-8">
            <p className="display-lg">NOTHING<br />FITS.</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-grey2">
              LOOSEN THE FILTERS OR WAIT FOR THE NEXT DROP.
            </p>
            <button type="button" onClick={reset} className="btn-brut">RESET FILTERS</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {filtered.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 4) * 70} className="h-full">
                <ProductCard product={p} className="h-full" />
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t-2 border-ink pt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-grey2 sm:flex-row sm:items-center">
          <span>ALL PRICES INCL. GST — SHIPPING FREE IN INDIA</span>
          <Link href="/about" className="text-ink underline underline-offset-4 hover:text-accent">
            HOW WE MAKE THEM →
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}
