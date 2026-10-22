import Hero from "@/components/home/Hero";
import Marquee from "@/components/Marquee";
import Manifesto from "@/components/home/Manifesto";
import Craft from "@/components/home/Craft";
import Details from "@/components/home/Details";
import FeaturedRail from "@/components/FeaturedRail";
import CollectionBanner from "@/components/home/CollectionBanner";
import Cta from "@/components/home/Cta";
import Newsletter from "@/components/home/Newsletter";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";
import { preload } from "react-dom";

export const metadata = pageMetadata({
  title: "SATELLITE® — Sneakers Built From Motion",
  description: site.description,
  path: "/",
});

export default function HomePage() {
  // Warm the hero LCP image ahead of client hydration.
  preload("/images/hero-poster.webp", {
    as: "image",
    fetchPriority: "high",
  });

  return (
    <>
      <Hero />
      <Marquee text="LIMITED RUNS ✳ NO RESTOCKS ✳ MADE IN INDIA" />
      <Manifesto />
      <Craft />
      <Details />
      <FeaturedRail />
      <Marquee text="BUILT FROM MOTION" invert speed={30} />
      <CollectionBanner />
      <Cta />
      <Newsletter />
    </>
  );
}
