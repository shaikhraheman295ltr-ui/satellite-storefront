import Image from "next/image";
import Link from "next/link";
import Parallax from "@/components/Parallax";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Studio — Manifesto — SATELLITE®",
  description:
    "SATELLITE is a footwear studio in Mumbai. Fifteen silhouettes, limited runs, honest construction. Read what we refuse to do.",
  path: "/about",
});

const rules = [
  ["01", "NO SEASONS", "We drop when a shoe is finished, not when a calendar says so."],
  ["02", "NO RESTOCKS", "Four hundred pairs. The mould is destroyed after the run."],
  ["03", "NO LOGOS", "If you need the logo to explain the shoe, the shoe failed."],
  ["04", "NO RENDERED LUXURY", "Every frame you scrolled through is real footage, not CGI."],
  ["05", "NO WASTE", "Offcut yarn becomes lace. Offcut suede becomes the heel tab."],
  ["06", "NO SHORTCUTS", "Six hours of hand lasting per pair. That is the entire trick."],
];

const timeline = [
  ["2021", "Studio opened in Andheri West with one last and a borrowed sewing machine."],
  ["2022", "First run of 40 pairs sold to friends and one very confused courier."],
  ["2023", "Moved production to Aurangabad. Started cutting our own suede panels."],
  ["2024", "Drop 02 sold out in 11 minutes. We stopped announcing exact times."],
  ["2025", "Dual-density sole developed in-house. 392 g achieved."],
  ["2026", "Drop 04. Four hundred pairs. Fifteen silhouettes. This page."],
];

/* Campaign boards — poster work cut between drops. Every source shot now lives
   on the site: 11 as product/editorial shots, these 12 as the board wall. */
const boards = [
  { src: "/images/1.webp", w: 735, h: 736, n: "01", t: "ROCK & ROPE" },
  { src: "/images/3.webp", w: 736, h: 921, n: "02", t: "STEP UP" },
  { src: "/images/4.webp", w: 736, h: 736, n: "03", t: "COMFORT OF LIFE" },
  { src: "/images/6.webp", w: 736, h: 734, n: "04", t: "PAPER DUNKS" },
  { src: "/images/11.webp", w: 736, h: 981, n: "05", t: "STEP INTO YOUR FLOW" },
  { src: "/images/17.webp", w: 736, h: 1104, n: "06", t: "ELEVATE" },
  { src: "/images/18.webp", w: 736, h: 1041, n: "07", t: "1948 SUEDE" },
  { src: "/images/19.webp", w: 736, h: 920, n: "08", t: "CORTADO STAR" },
  { src: "/images/21.webp", w: 736, h: 736, n: "09", t: "ICON" },
  { src: "/images/22.webp", w: 736, h: 920, n: "10", t: "BIG SALE" },
  { src: "/images/25.webp", w: 736, h: 1041, n: "11", t: "2002R" },
  { src: "/images/26.webp", w: 736, h: 736, n: "12", t: "PURCHASE NOW" },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b-2 border-ink bg-bg px-4 pb-10 pt-24 md:px-6 md:pb-14 md:pt-28">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex items-center justify-between border-b-2 border-ink pb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-grey2">
            <span>STUDIO / MANIFESTO</span>
            <span>MUMBAI — EST. 2021</span>
          </div>
          <h1 className="display-xl mt-6">
            WE DON’T
            <br />
            MAKE SHOES<span className="text-accent">.</span>
            <br />
            WE MAKE
            <br />
            DECISIONS<span className="text-accent">.</span>
          </h1>
          <div className="mt-8 grid gap-6 border-t-2 border-ink pt-4 md:grid-cols-3">
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em]">
              SATELLITE IS A FOOTWEAR STUDIO. NOT A BRAND, NOT A LIFESTYLE, NOT A
              COLLAB. A ROOM WITH PEOPLE IN IT, CUTTING SUEDE.
            </p>
            <p className="text-sm leading-relaxed text-grey2 md:col-span-2">
              We started because the shoes we wanted did not exist at a price
              that made sense. Everything here is built around one question:
              would we wear it until the sole dies? If the answer is no, it does
              not leave the studio. That is why there are fifteen silhouettes and
              not eighty.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-bg">
        <Reveal>
          <div className="mx-auto grid max-w-[1600px] gap-3 px-4 py-8 md:grid-cols-12 md:px-6 md:py-12">
          <Parallax className="aspect-[4/3] border-2 border-ink md:col-span-8">
            <Image src="/images/20.webp" alt="SATELLITE pair photographed in the studio" width={736} height={736} sizes="(max-width: 768px) 100vw, 66vw" className="h-full w-full object-cover" />
          </Parallax>
          <div className="flex flex-col justify-between border-2 border-ink bg-invertbg p-4 text-invertink md:col-span-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-invertink/50">OBJECT / 04</span>
            <p className="font-display text-2xl uppercase leading-none md:text-3xl">
              THE SHOE SHOULD BE THE LOUDEST THING IN THE ROOM. THE BRAND SHOULD
              BE THE QUIETEST.
            </p>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-invertink/50">
              STUDIO NOTE — 2026
            </div>
          </div>
          <div className="flex flex-col justify-between border-2 border-ink p-4 md:col-span-4">
            <span className="section-index w-max">RULES</span>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-grey2">
              Six rules, printed and pinned above the cutting table. They have
              not changed since 2021. They are not marketing.
            </p>
          </div>
          <Parallax strength={0.06} className="aspect-[4/3] border-2 border-ink md:col-span-8">
            <Image src="/images/23.webp" alt="Close-up of stitching on a Satellite sneaker" width={736} height={932} sizes="(max-width: 768px) 100vw, 66vw" className="h-full w-full object-cover" />
          </Parallax>
        </div>
        </Reveal>
      </section>

      <section className="border-y-2 border-ink bg-bg">
        <Reveal>
          <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 md:py-16">
            <div className="mb-6 flex items-center justify-between">
            <h2 className="display-lg">THE RULES<span className="text-accent">.</span></h2>
            <span className="meta">NON-NEGOTIABLE / 06</span>
          </div>
          <ul className="grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
            {rules.map(([n, t, d]) => (
              <li key={n} className="bg-bg p-4 md:p-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] tracking-[0.2em] text-grey2">{n}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent">RULE</span>
                </div>
                <h3 className="mt-5 font-display text-xl uppercase leading-none md:text-2xl">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-grey2">{d}</p>
              </li>
            ))}
          </ul>
          </div>
        </Reveal>
      </section>

      <section className="bg-bg">
        <Reveal>
          <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 md:py-16">
            <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <span className="section-index">TIMELINE / 2021—2026</span>
              <h2 className="display-lg mt-4">FIVE<br />YEARS<br />IN<span className="text-accent">.</span></h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-grey2">
                No funding rounds, no celebrity co-signs. Just a studio that kept
                showing up and a warehouse that kept emptying.
              </p>
            </div>
            <ol className="md:col-span-8">
              {timeline.map(([y, t]) => (
                <li key={y} className="grid grid-cols-[80px_1fr] gap-4 border-t border-ink/20 py-4 md:grid-cols-[120px_1fr]">
                  <span className="font-display text-2xl leading-none md:text-3xl">{y}</span>
                  <p className="max-w-xl text-sm leading-relaxed text-grey2">{t}</p>
                </li>
              ))}
            </ol>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-y-2 border-ink bg-bg">
        <Reveal>
          <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 md:py-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="display-lg">THE BOARD WALL<span className="text-accent">.</span></h2>
              <span className="meta">CAMPAIGN / CLIENT WORK — 12</span>
            </div>
            <p className="mb-8 max-w-xl text-sm leading-relaxed text-grey2">
              Between drops we cut campaign boards for other houses — sneakers,
              sport, street. Logos theirs. Lighting, retouch and obsession ours.
              The same hands that last our uppers put these together.
            </p>
            <div className="grid gap-3 border-2 border-ink bg-ink p-3 sm:grid-cols-2 md:grid-cols-4">
              {boards.map((b) => (
                <figure key={b.src} className="border-2 border-ink bg-bg">
                  <Image
                    src={b.src}
                    alt={`Campaign board ${b.n} — ${b.t}`}
                    width={b.w}
                    height={b.h}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-auto w-full"
                  />
                  <figcaption className="flex items-baseline justify-between border-t-2 border-ink px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-grey2">
                    <span className="text-ink">BOARD {b.n}</span>
                    <span>{b.t}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <Marquee text="MADE IN INDIA ✳ CUT BY HAND ✳ NO RESTOCKS" />

      <section className="bg-bg px-4 py-12 md:px-6 md:py-20">
        <Reveal>
          <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <h2 className="display-lg">
            NOW GO
            <br />
            LOOK AT
            <br />
            THE SHOES<span className="text-accent">.</span>
          </h2>
            <Link href="/shop" className="btn-brut btn-brut-accent">SHOP THE COLLECTION →</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
