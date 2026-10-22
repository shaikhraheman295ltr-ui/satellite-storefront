import Link from "next/link";
import WishlistGrid from "@/components/WishlistGrid";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Saved — SATELLITE®",
  description: "Pairs you have saved for later at SATELLITE®.",
  path: "/wishlist",
  noindex: true,
  follow: true,
});

export default function WishlistPage() {
  return (
    <section className="min-h-screen bg-bg px-4 pb-16 pt-24 md:px-6 md:pt-28">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-end justify-between border-b-2 border-ink pb-3">
          <div>
            <span className="section-index">SAVED / WISHLIST</span>
            <h1 className="display-xl mt-3">
              KEEP
              <br />
              LOOKING<span className="text-accent">.</span>
            </h1>
          </div>
          <Link
            href="/shop"
            className="font-mono text-[10px] uppercase tracking-[0.18em] underline underline-offset-4 hover:text-accent"
          >
            ← BACK TO INDEX
          </Link>
        </div>
        <WishlistGrid />
      </div>
    </section>
  );
}
