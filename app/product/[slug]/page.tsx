import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/product/Gallery";
import ProductPanel from "@/components/product/ProductPanel";
import { getProduct, products, related } from "@/data/products";
import { formatINR } from "@/lib/format";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) {
    return {
      title: { absolute: "Product not found — SATELLITE®" },
      robots: { index: false, follow: false },
    };
  }
  return pageMetadata({
    title: `${p.name} — SATELLITE®`,
    description: p.short,
    path: `/product/${p.slug}`,
    image: {
      url: p.gallery[0].src,
      width: p.gallery[0].w,
      height: p.gallery[0].h,
      alt: p.gallery[0].alt ?? p.name,
    },
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const rel = related(slug, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short,
    sku: p.id,
    image: [`${site.domain}${p.gallery[0].src}`],
    brand: { "@type": "Brand", name: "SATELLITE" },
    offers: {
      "@type": "Offer",
      url: `${site.domain}/product/${p.slug}`,
      priceCurrency: "INR",
      price: p.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-[1600px] px-4 pt-20 md:px-6 md:pt-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 border-b border-ink/20 pb-2 font-mono text-[9px] uppercase tracking-[0.18em] text-grey2">
          <Link href="/" className="hover:text-accent">HOME</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-accent">SHOP</Link>
          <span>/</span>
          <span className="text-ink">{p.category}</span>
          <span>/</span>
          <span className="text-ink">{p.index}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 md:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-12">
        <Gallery product={p} />
        <div className="lg:sticky lg:top-20 lg:h-max">
          <ProductPanel product={p} />
        </div>
      </div>

      <section aria-labelledby="related-title" className="border-t-2 border-ink">
        <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 md:py-14">
          <div className="mb-5 flex items-end justify-between border-b-2 border-ink pb-3">
            <h2 id="related-title" className="display-lg">ALSO<br />MOVING<span className="text-accent">.</span></h2>
            <Link href="/shop" className="font-mono text-[10px] uppercase tracking-[0.18em] underline underline-offset-4 hover:text-accent">
              VIEW ALL →
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {rel.map((r) => (
              <li key={r.slug} className="border-2 border-ink">
                <Link href={`/product/${r.slug}`} className="group block">
                  <div className="relative aspect-square border-b-2 border-ink bg-grey1">
                    <Image
                      src={r.gallery[0].src}
                      alt={r.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover object-bottom origin-bottom transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="font-display text-[10px] uppercase leading-tight md:text-xs">{r.name}</span>
                    <span className="shrink-0 font-mono text-[10px]">{formatINR(r.price)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
