import Image from "next/image";
import Parallax from "@/components/Parallax";
import Reveal from "@/components/Reveal";
import { manifesto } from "@/data/site";

export default function Manifesto() {
  return (
    <section className="border-t-2 border-ink bg-bg" aria-labelledby="manifesto-title">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24">
        <div className="flex items-center justify-between border-b-2 border-ink pb-3">
          <span className="section-index">00 / MANIFESTO</span>
          <span className="meta">SATELLITE STUDIO — EST. 2021</span>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <h2 id="manifesto-title" className="display-lg">
              QUIET SHOES
              <br />
              FOR LOUD
              <br />
              CITIES<span className="text-accent">.</span>
            </h2>
            <div className="mt-8 space-y-4 border-l-2 border-ink pl-4">
              {manifesto.map((p, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "font-mono text-[11px] uppercase leading-relaxed tracking-[0.15em]"
                      : "max-w-xl text-sm leading-relaxed text-grey2"
                  }
                >
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-px border-2 border-ink bg-ink">
              {[
                ["08", "SILHOUETTES"],
                ["400", "PAIRS / DROP"],
                ["100%", "MADE IN INDIA"],
              ].map(([k, v]) => (
                <div key={v} className="bg-bg p-3 md:p-4">
                  <div className="font-display text-2xl leading-none md:text-4xl">{k}</div>
                  <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-grey2">{v}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="md:col-span-5" delay={120}>
            <div className="grid grid-cols-2 gap-3">
              <Parallax className="col-span-2 aspect-[4/3] border-2 border-ink">
                <Image
                  src="/images/12.webp"
                  alt="Satellite studio — sneaker on a bright seamless floor"
                  width={736}
                  height={920}
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="h-full w-full object-cover"
                />
              </Parallax>
              <Parallax strength={0.06} className="aspect-[3/4] border-2 border-ink">
                <Image
                  src="/images/9.webp"
                  alt="Detail of the Phantom Runner GT outsole"
                  width={736}
                  height={1313}
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="h-full w-full object-cover"
                />
              </Parallax>
              <div className="flex aspect-[3/4] flex-col justify-between border-2 border-ink bg-invertbg p-3 text-invertink">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-invertink/50">
                  SPEC SHEET / 04
                </span>
                <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em]">
                  42 MM STACK.
                  <br />
                  392 G.
                  <br />
                  ZERO LOGOS.
                  <br />
                  ONE ORANGE DOT.
                </p>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent">SAT—26</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
