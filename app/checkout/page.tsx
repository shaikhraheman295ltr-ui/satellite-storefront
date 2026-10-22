"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart, subtotal } from "@/store/cart";
import { formatINR } from "@/lib/format";

type Pay = "RAZORPAY" | "COD";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const [pay, setPay] = useState<Pay>("RAZORPAY");
  const [placed, setPlaced] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "", first: "", last: "", address: "", city: "", state: "", pin: "", phone: "",
  });
  const confirmationRef = useRef<HTMLHeadingElement>(null);
  const total = subtotal(items);

  useEffect(() => {
    if (placed) confirmationRef.current?.focus();
  }, [placed]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `SH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setPlaced(id);
    clear();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  if (placed) {
    return (
      <section className="min-h-screen bg-bg px-4 pb-16 pt-28 md:px-6">
        <div className="mx-auto max-w-3xl">
          <span className="section-index">ORDER / CONFIRMED</span>
          <h1 ref={confirmationRef} tabIndex={-1} className="display-xl mt-6 focus:outline-none">
            YOU
            <br />
            MOVED<span className="text-accent">.</span>
          </h1>
          <div className="mt-8 border-2 border-ink">
            <div className="flex justify-between border-b-2 border-ink p-4 font-mono text-[10px] uppercase tracking-[0.2em]">
              <span>ORDER {placed}</span>
              <span>{pay === "RAZORPAY" ? "PAYMENT PENDING" : "CASH ON DELIVERY"}</span>
            </div>
            <div className="p-4 md:p-6">
              <p className="max-w-lg text-sm leading-relaxed text-grey2">
                A confirmation is on its way to <strong className="text-ink">{form.email || "your inbox"}</strong>.
                {pay === "RAZORPAY"
                  ? " The Razorpay sheet opens from the confirmation email — this demo stops short of charging a real card."
                  : " Keep the exact amount ready; the courier collects on delivery."}
              </p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-grey2">
                DISPATCH WITHIN 24H — MUMBAI WAREHOUSE
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/shop" className="btn-brut">KEEP BROWSING →</Link>
                <Link href="/" className="btn-brut">HOME</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bg px-4 pb-16 pt-24 md:px-6 md:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between border-b-2 border-ink pb-3">
          <div>
            <span className="section-index">CHECKOUT / 01</span>
            <h1 className="display-lg mt-3">FINAL<br />STEPS<span className="text-accent">.</span></h1>
          </div>
          <Link href="/shop" className="font-mono text-[10px] uppercase tracking-[0.18em] underline underline-offset-4 hover:text-accent">
            ← BACK TO INDEX
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 flex flex-col items-start gap-4 border-2 border-ink p-8">
            <p className="display-lg">CART IS<br />EMPTY.</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-grey2">
              ADD A PAIR FIRST — THEN COME BACK.
            </p>
            <Link href="/shop" className="btn-brut btn-brut-accent">SHOP FOOTWEAR →</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <form onSubmit={submit} className="space-y-8">
              <fieldset className="border-2 border-ink">
                <legend className="ml-3 px-1 font-mono text-[10px] uppercase tracking-[0.24em]">01 / CONTACT</legend>
                <div className="grid gap-4 p-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="meta">EMAIL *</span>
                    <input required type="email" value={form.email} onChange={set("email")} className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none" placeholder="YOU@DOMAIN.COM" />
                  </label>
                  <label className="block">
                    <span className="meta">PHONE *</span>
                    <input required type="tel" value={form.phone} onChange={set("phone")} className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none" placeholder="+91" />
                  </label>
                </div>
              </fieldset>

              <fieldset className="border-2 border-ink">
                <legend className="ml-3 px-1 font-mono text-[10px] uppercase tracking-[0.24em]">02 / SHIPPING</legend>
                <div className="grid gap-4 p-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="meta">FIRST NAME *</span>
                    <input required value={form.first} onChange={set("first")} className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none" />
                  </label>
                  <label className="block">
                    <span className="meta">LAST NAME *</span>
                    <input required value={form.last} onChange={set("last")} className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="meta">ADDRESS *</span>
                    <input required value={form.address} onChange={set("address")} className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none" placeholder="STREET, BUILDING, FLAT" />
                  </label>
                  <label className="block">
                    <span className="meta">CITY *</span>
                    <input required value={form.city} onChange={set("city")} className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none" />
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="meta">STATE *</span>
                      <input required value={form.state} onChange={set("state")} className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none" />
                    </label>
                    <label className="block">
                      <span className="meta">PIN *</span>
                      <input required inputMode="numeric" value={form.pin} onChange={set("pin")} className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none" />
                    </label>
                  </div>
                </div>
              </fieldset>

              <fieldset className="border-2 border-ink">
                <legend className="ml-3 px-1 font-mono text-[10px] uppercase tracking-[0.24em]">03 / PAYMENT</legend>
                <div className="p-4">
                  {(["RAZORPAY", "COD"] as Pay[]).map((m) => (
                    <label key={m} className="flex cursor-pointer items-center gap-3 border-b border-ink/15 py-3 last:border-0">
                      <input
                        type="radio"
                        name="pay"
                        checked={pay === m}
                        onChange={() => setPay(m)}
                        className="h-4 w-4 accent-[#FF3B00]"
                      />
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
                        {m === "RAZORPAY" ? "RAZORPAY / UPI · CARD · NETBANKING" : "CASH ON DELIVERY / INDIA ONLY"}
                      </span>
                      {m === "RAZORPAY" && <span className="ml-auto border border-ink px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.15em]">READY</span>}
                    </label>
                  ))}
                  <p className="mt-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.15em] text-grey2">
                    DEMO CHECKOUT — RAZORPAY KEY PLACEHOLDER IN <code>lib/payments.ts</code>. NO REAL CHARGE.
                  </p>
                </div>
              </fieldset>

              <button type="submit" className="btn-brut btn-brut-accent w-full py-4">
                {pay === "RAZORPAY" ? "PAY SECURELY →" : "PLACE COD ORDER →"} {formatINR(total)}
              </button>
            </form>

            <aside className="h-max border-2 border-ink lg:sticky lg:top-20" aria-label="Order summary">
              <h2 className="border-b-2 border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em]">ORDER SUMMARY</h2>
              <ul className="divide-y divide-ink/10">
                {items.map((it) => (
                  <li key={`${it.slug}-${it.size}`} className="flex gap-3 p-3">
                    <div className="relative h-16 w-14 shrink-0 border border-ink bg-grey1">
                      <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover object-bottom" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <span className="font-display text-[10px] uppercase leading-tight">{it.name}</span>
                        <span className="font-mono text-[10px]">{formatINR(it.price * it.qty)}</span>
                      </div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-grey2">EU {it.size} / QTY {it.qty}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="space-y-2 border-t-2 border-ink p-3 font-mono text-[10px] uppercase tracking-[0.15em]">
                <div className="flex justify-between"><dt className="text-grey2">SUBTOTAL</dt><dd>{formatINR(total)}</dd></div>
                <div className="flex justify-between"><dt className="text-grey2">SHIPPING</dt><dd className="text-accent">FREE</dd></div>
                <div className="flex justify-between border-t-2 border-ink pt-2 text-sm"><dt>TOTAL</dt><dd>{formatINR(total)}</dd></div>
              </dl>
              <p className="border-t border-ink/15 p-3 font-mono text-[8px] uppercase leading-relaxed tracking-[0.15em] text-grey2">
                PRICES INCLUDE GST. SHIPPED FROM MUMBAI. 14-DAY RETURNS.
              </p>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
