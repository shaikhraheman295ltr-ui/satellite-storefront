import Link from "next/link";
import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-invertbg text-invertink">
      <div className="mx-auto max-w-[1600px] px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="font-display text-4xl uppercase leading-[0.9] tracking-[-0.03em] md:text-6xl">
              SATELLITE<span className="text-accent">®</span>
              <br />
              BUILT FROM MOTION.
            </div>
            <p className="mt-5 max-w-sm font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-invertink/60">
              Footwear studio. Limited runs. No restocks. Everything you see is
              assembled in India and shipped worldwide from Mumbai.
            </p>
          </div>

          <nav className="md:col-span-2" aria-label="Shop links">
            <h2 className="meta !text-invertink/55">Shop</h2>
            <ul className="mt-3 space-y-2 font-mono text-xs uppercase tracking-[0.14em]">
              <li><Link href="/shop" className="hover:text-accent">All footwear</Link></li>
              <li><Link href="/shop?c=RUNNER" className="hover:text-accent">Runners</Link></li>
              <li><Link href="/shop?c=LOAFER" className="hover:text-accent">Loafers</Link></li>
              <li><Link href="/shop?c=HIKER" className="hover:text-accent">Hikers</Link></li>
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-label="Studio links">
            <h2 className="meta !text-invertink/55">Studio</h2>
            <ul className="mt-3 space-y-2 font-mono text-xs uppercase tracking-[0.14em]">
              <li><Link href="/about" className="hover:text-accent">Manifesto</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
              <li><Link href="/wishlist" className="hover:text-accent">Saved</Link></li>
              <li><Link href="/checkout" className="hover:text-accent">Checkout</Link></li>
              <li><a href={`mailto:${site.contact.email}`} className="hover:text-accent">Wholesale</a></li>
            </ul>
          </nav>

          <div className="md:col-span-2">
            <h2 className="meta !text-invertink/55">Coordinates</h2>
            <p className="mt-3 font-mono text-xs uppercase leading-relaxed tracking-[0.12em] text-invertink/70">
              19.0760° N<br />72.8777° E<br />MUMBAI, IN
            </p>
            <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs">
              {site.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-invertink/40 px-2 py-1 hover:border-accent hover:text-accent"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-invertink/15">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-4 font-mono text-[9px] uppercase tracking-[0.2em] text-invertink/55 md:flex-row md:items-center md:justify-between md:px-6">
          <span>© 2026 {site.name} FOOTWEAR PVT LTD — ALL RIGHTS RESERVED</span>
          <span>SHIPPING WORLDWIDE / INR ₹ / RAZORPAY READY</span>
        </div>
      </div>
    </footer>
  );
}
