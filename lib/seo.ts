import type { Metadata } from "next";

export type OgImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export const defaultOgImage: OgImage = {
  url: "/images/hero-poster.webp",
  width: 1280,
  height: 720,
  alt: "SATELLITE Phantom Runner GT — hero film still",
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: OgImage;
  noindex?: boolean;
  follow?: boolean;
};

/**
 * Builds a complete, self-contained metadata block for a route.
 *
 * Keeping the social fields here avoids the root layout's home-page Open Graph
 * data leaking into every route (Next replaces openGraph as a whole object).
 */
export function pageMetadata({
  title,
  description,
  path,
  image = defaultOgImage,
  noindex = false,
  follow = true,
}: PageMetadataInput): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "SATELLITE®",
      url: path,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    ...(noindex ? { robots: { index: false, follow } } : {}),
  };
}
