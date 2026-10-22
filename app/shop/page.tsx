import { Suspense } from "react";
import ShopGrid from "@/components/shop/ShopGrid";
import ShopQuerySync from "@/components/shop/ShopQuerySync";
import Marquee from "@/components/Marquee";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shop — All Footwear — SATELLITE®",
  description:
    "The complete SATELLITE index: eight silhouettes, limited runs, made in India. Runners, loafers, hikers and slip-ons.",
  path: "/shop",
});

export default function ShopPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ShopQuerySync />
      </Suspense>

      <section className="border-b-2 border-ink bg-bg px-4 pb-8 pt-24 md:px-6 md:pb-10 md:pt-28">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between border-b-2 border-ink pb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-grey2">
            <span>INDEX / SHOP</span>
            <span>DROP 04 — SS26</span>
          </div>
          <h1 className="display-xl mt-6">
            THE
            <br />
            INDEX<span className="text-accent">.</span>
          </h1>
          <div className="mt-6 flex flex-col justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-grey2 md:flex-row md:items-end">
            <p className="max-w-md leading-relaxed">
              EIGHT SILHOUETTES. FOUR HUNDRED PAIRS EACH. EVERY PAIR NUMBERED,
              NONE RESTOCKED. FILTER IT DOWN OR TAKE IT ALL IN.
            </p>
            <p>SHOWING 08 / 08 — MUMBAI WAREHOUSE</p>
          </div>
        </div>
      </section>

      <div className="bg-bg px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-[1600px]">
          <ShopGrid />
        </div>
      </div>

      <Marquee text="FREE SHIPPING IN INDIA ✳ 14-DAY RETURNS ✳ LIMITED RUNS" invert speed={34} />
    </>
  );
}
