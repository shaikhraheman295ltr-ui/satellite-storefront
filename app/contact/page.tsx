import ContactForm from "@/components/ContactForm";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact — Talk to the Studio — SATELLITE®",
  description:
    "Order help, sizing, press and wholesale. Direct line to the SATELLITE studio in Mumbai.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="bg-bg px-4 pb-8 pt-24 md:px-6 md:pt-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-center justify-between border-b-2 border-ink pb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-grey2">
            <span>CONTACT / DIRECT LINE</span>
            <span>REPLIES IN &lt; 1 WORKING DAY</span>
          </div>
          <h1 className="display-xl mt-6">
            TALK
            <br />
            TO THE
            <br />
            STUDIO<span className="text-accent">.</span>
          </h1>
        </div>
      </section>

      <section className="bg-bg px-4 pb-16 md:px-6">
        <div className="mx-auto grid max-w-[1400px] gap-8 border-t-2 border-ink pt-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
          <div>
            <div className="border-2 border-ink">
              <div className="border-b-2 border-ink p-4">
                <span className="meta">STUDIO</span>
                <p className="mt-2 font-mono text-xs uppercase leading-relaxed tracking-[0.12em]">
                  {site.contact.address}
                </p>
              </div>
              <dl className="divide-y divide-ink/15">
                <div className="flex justify-between gap-4 p-4 font-mono text-[10px] uppercase tracking-[0.14em]">
                  <dt className="text-grey2">EMAIL</dt>
                  <dd><a href={`mailto:${site.contact.email}`} className="underline underline-offset-2 hover:text-accent">{site.contact.email}</a></dd>
                </div>
                <div className="flex justify-between gap-4 p-4 font-mono text-[10px] uppercase tracking-[0.14em]">
                  <dt className="text-grey2">PHONE</dt>
                  <dd><a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="underline underline-offset-2 hover:text-accent">{site.contact.phone}</a></dd>
                </div>
                <div className="flex justify-between gap-4 p-4 font-mono text-[10px] uppercase tracking-[0.14em]">
                  <dt className="text-grey2">HOURS</dt>
                  <dd>{site.contact.hours}</dd>
                </div>
              </dl>
              <div className="border-t-2 border-ink bg-invertbg p-4 text-invertink">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-invertink/50">COORDINATES</span>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em]">
                  19.0760° N / 72.8777° E
                  <br />
                  MUMBAI, MAHARASHTRA — IN
                </p>
              </div>
            </div>

            <div className="mt-4 border-2 border-ink p-4">
              <span className="meta">OTHER LINES</span>
              <ul className="mt-2 space-y-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                <li className="flex justify-between"><span className="text-grey2">PRESS</span><a href="mailto:press@satellite.in" className="hover:text-accent">PRESS@SATELLITE.IN</a></li>
                <li className="flex justify-between"><span className="text-grey2">WHOLESALE</span><a href="mailto:trade@satellite.in" className="hover:text-accent">TRADE@SATELLITE.IN</a></li>
                <li className="flex justify-between"><span className="text-grey2">INSTAGRAM</span><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-accent">@SATELLITE.FTW</a></li>
              </ul>
            </div>

            <details className="mt-4 border-2 border-ink">
              <summary className="cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                DO YOU SHIP WORLDWIDE?
              </summary>
              <p className="border-t border-ink/15 px-4 py-3 text-sm leading-relaxed text-grey2">
                Yes. India is free, everywhere else is ₹1,200 flat. Duties are
                calculated at the border and are the buyer’s responsibility.
              </p>
            </details>
            <details className="mt-2 border-2 border-ink">
              <summary className="cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-[0.2em]">
                HOW DO I EXCHANGE A SIZE?
              </summary>
              <p className="border-t border-ink/15 px-4 py-3 text-sm leading-relaxed text-grey2">
                Mail us within 14 days with the order number. If the size is in
                stock we reserve it and send a pickup label. One exchange per
                order, no questions.
              </p>
            </details>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between border-b-2 border-ink pb-2">
              <span className="section-index">FORM / 01</span>
              <span className="meta">ALL FIELDS REQUIRED</span>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
