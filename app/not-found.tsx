import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "404 — Page Not Found — SATELLITE®" },
  description: "The page you are looking for does not exist in this drop.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col justify-between bg-ink px-4 pb-8 pt-24 text-invertink md:px-6">
      <div className="flex items-center justify-between border-b-2 border-invertink/25 pb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-invertink/50">
        <span>ERROR / 404</span>
        <span>PAGE NOT IN THE INDEX</span>
      </div>
      <div>
        <h1 className="display-xl">
          4
          <br />
          0
          <br />
          4<span className="text-accent">.</span>
        </h1>
        <p className="mt-6 max-w-md font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-invertink/60">
          THIS PAGE WAS NEVER CUT, LASTED OR STITCHED. IT DOES NOT EXIST IN THIS
          DROP. TRY THE INDEX INSTEAD.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className="btn-brut btn-brut-accent bg-bg text-ink">SHOP THE COLLECTION →</Link>
          <Link href="/" className="btn-brut-invert">BACK TO HERO</Link>
        </div>
      </div>
      <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-invertink/55">
        <span>SATELLITE® / MUMBAI</span>
        <span>19.0760° N / 72.8777° E</span>
      </div>
    </section>
  );
}
