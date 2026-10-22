"use client";

import { useEffect, useRef, useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", topic: "ORDER", message: "" });
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  if (sent) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="border-2 border-ink bg-accent p-6 text-bg focus:outline-none"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em]">MESSAGE / RECEIVED</p>
        <p className="mt-3 font-display text-3xl uppercase leading-none">
          WE’LL GET BACK WITHIN ONE WORKING DAY.
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "ORDER", message: "" }); }}
          className="mt-6 border-2 border-bg px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-bg hover:text-accent"
        >
          SEND ANOTHER →
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="meta !text-ink">NAME *</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none"
            placeholder="FULL NAME"
          />
        </label>
        <label className="block">
          <span className="meta !text-ink">EMAIL *</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full border-b-2 border-ink bg-transparent py-2 font-mono text-sm focus:outline-none"
            placeholder="YOU@DOMAIN.COM"
          />
        </label>
      </div>

      <fieldset>
        <legend className="meta !text-ink mb-2">TOPIC</legend>
        <div className="flex flex-wrap gap-2">
          {["ORDER", "SIZING", "PRESS", "WHOLESALE"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, topic: t })}
              aria-pressed={form.topic === t}
              className={`border-2 border-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                form.topic === t ? "bg-ink text-bg" : "hover:bg-grey1"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="meta !text-ink">MESSAGE *</span>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-1 w-full resize-none border-2 border-ink bg-transparent p-3 font-mono text-sm focus:outline-none"
          placeholder="TELL US WHAT'S WRONG, WHAT YOU NEED, OR WHY YOU'RE HERE."
        />
      </label>

      <button type="submit" className="btn-brut btn-brut-accent w-full py-4">
        SEND MESSAGE →
      </button>
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-grey2">
        WE REPLY MON–FRI, 10:00–19:00 IST. NO BOTS, NO TICKET NUMBERS.
      </p>
    </form>
  );
}
