export type SequenceCfg = {
  id: string;
  /** remaining section label, e.g. "01 / HERO" */
  label: string;
  place: string;
  folder: string;
  frames: number;
  width: number;
  height: number;
  fps: number;
  /** mobile variant folder (half-res webp). omit for already-small sequences */
  mobileFolder?: string;
  poster: string;
};

/**
 * Auto-generated from the asset scan (see ASSET_REPORT.md).
 * Sources in /frames/*.jpg — optimized WebP copies live in /public/frames.
 * 2.3 was trimmed (black lead 1–10 / tail 202–213) and renumbered 1–191.
 * v1 sequence is reused twice (hero + inverted CTA tail 218–247).
 */
/**
 * The hero/CTA source sequence is the only folder excluded from autoplay.
 * Its frames stay on the original scroll-controlled, play-once-to-hold
 * behaviour. Mobile variants (e.g. /frames/v1/m) are excluded by prefix.
 */
export const AUTO_LOOP_EXCLUDED_FOLDERS = ["/frames/v1"] as const;

export const isAutoLoopExcluded = (folder: string) =>
  AUTO_LOOP_EXCLUDED_FOLDERS.some(
    (excluded) => folder === excluded || folder.startsWith(`${excluded}/`)
  );

export const sequences: Record<string, SequenceCfg> = {
  hero: {
    id: "hero",
    label: "01 / HERO",
    place: "Full-bleed pinned hero",
    folder: "/frames/v1",
    frames: 247,
    width: 1280,
    height: 720,
    fps: 24,
    mobileFolder: "/frames/v1/m",
    poster: "/images/hero-poster.webp",
  },
  craft: {
    id: "craft",
    label: "02 / CRAFT",
    place: "Full-bleed making-of",
    folder: "/frames/2.1",
    frames: 150,
    width: 720,
    height: 1280,
    fps: 24,
    mobileFolder: "/frames/2.1/m",
    poster: "/frames/2.1/f0001.webp",
  },
  details: {
    id: "details",
    label: "03 / DETAILS",
    place: "Bordered portrait panel",
    folder: "/frames/2.2",
    frames: 150,
    width: 720,
    height: 1280,
    fps: 24,
    mobileFolder: "/frames/2.2/m",
    poster: "/frames/2.2/f0001.webp",
  },
  collection: {
    id: "collection",
    label: "04 / COLLECTION",
    place: "Shop banner — hover + scrub",
    folder: "/frames/2.3",
    frames: 191,
    width: 736,
    height: 414,
    fps: 24,
    mobileFolder: "/frames/2.3/m",
    poster: "/frames/2.3/f0001.webp", // copy is renumbered 1–191 (originals 11–201)
  },
  cta: {
    id: "cta",
    label: "05 / CTA",
    place: "Inverted closing section",
    folder: "/frames/v1",
    frames: 247,
    width: 1280,
    height: 720,
    fps: 24,
    mobileFolder: "/frames/v1/m",
    poster: "/frames/v1/f0218.webp",
  },
};

export const SEQUENCES = sequences;
