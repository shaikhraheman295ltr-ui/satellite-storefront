"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  return (
    <section className="border-t-2 border-ink bg-bg" aria-labelledby="newsletter-title">
      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-14 md:grid-cols-12 md:px-6 md:py-20">
        <div className="md:col-span-5">
          <span className="section-index">06 / TRANSMISSION</span>
          <h2 id="newsletter-title" className="display-lg mt-4">
            GET THE
            <br />
            DROP FIRST<span className="text-accent">.</span>
          </h2>
        </div>
        <div className="md:col-span-7 md:pt-10">
          <p className="max-w-lg font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-grey2">
            NO NEWSLETTER SPAM. ONE MESSAGE PER DROP, ONE REMINDER BEFORE IT
            SELLS OUT. UNSUBSCRIBE IN ONE CLICK, LIKE EVERYTHING ELSE SHOULD BE.
          </p>
          {sent ? (
            <div
              ref={successRef}
              tabIndex={-1}
              role="status"
              aria-live="polite"
              className="mt-6 border-2 border-ink bg-accent p-4 font-mono text-xs uppercase tracking-[0.18em] text-bg focus:outline-none"
            >
              SUBSCRIBED — CHECK YOUR INBOX FOR DROP 04 / {new Date().getFullYear()}.
            </div>
          ) : (
            <form
              className="mt-6 flex flex-col gap-0 border-2 border-ink sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setSent(true);
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="flex-1 bg-bg px-4 py-4 font-mono text-xs uppercase tracking-[0.15em] text-ink placeholder:text-grey2 focus:outline-none"
              />
              <button type="submit" className="border-t-2 border-ink bg-ink px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-bg hover:bg-accent hover:text-bg sm:border-l-2 sm:border-t-0">
                SUBSCRIBE →
              </button>
            </form>
          )}
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-grey2">
            BY SUBSCRIBING YOU AGREE TO THE {site.name} PRIVACY POLICY — MUMBAI, IN.
          </p>
        </div>
      </div>
    </section>
  );
}
