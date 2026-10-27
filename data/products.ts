export type Product = {
  slug: string;
  id: string;
  name: string;
  category: "RUNNER" | "LOAFER" | "HIKER" | "SLIP-ON";
  price: number; // INR
  colorway: string;
  sizes: number[];
  drop: string;
  specs: { k: string; v: string }[];
  gallery: { src: string; alt?: string; w: number; h: number }[];
  short: string;
  story: string;
  featured?: boolean;
  index: string;
};

function img(n: string, w: number, h: number) {
  return { src: `/images/${n}.webp`, w, h };
}

/* Mapping derived from the asset-report clustering (bright/dark/warm groups).
   Edit freely — files live in /public/images. */
export const products: Product[] = [
  {
    slug: "orbit-runner-01",
    id: "P-01",
    index: "001",
    name: "ORBIT 01 “CONCRETE WAVE”",
    category: "RUNNER",
    price: 8490,
    colorway: "RAW WHITE / CEMENT",
    sizes: [41, 42, 43, 44, 45, 46],
    drop: "DROP 04 — 2026",
    featured: true,
    short: "The studio runner. Chunky cupsole, zero branding, all shadow.",
    story:
      "Built from 300 hours of walk-cycle capture. The ORBIT 01 is our default option for sidewalks that don’t care about your outfit.",
    specs: [
      { k: "UPPER", v: "Full-grain suede + ripstop mesh" },
      { k: "SOLE", v: "Two-tone vulcanised cupsole, 38 mm" },
      { k: "LACES", v: "Flat 8 mm off-white cotton" },
      { k: "WEIGHT", v: "392 g (EU 42)" },
      { k: "MADE IN", v: "Aurangabad, India" },
    ],
    gallery: [img("16", 736, 981), img("13", 672, 1195)],
  },
  {
    slug: "eclipse-runner-low",
    id: "P-02",
    index: "002",
    name: "ECLIPSE LOW “PAPER MOON”",
    category: "RUNNER",
    price: 7990,
    colorway: "BONE / COOL GREY",
    sizes: [40, 41, 42, 43, 44, 46],
    drop: "DROP 04 — 2026",
    featured: true,
    short: "Lit from every angle. A runner that behaves like daylight.",
    story:
      "Shot under studio sun. The low-profile Eclipse is the quiet one in the row — soft heel, hard opinions.",
    specs: [
      { k: "UPPER", v: "Calendered canvas + TPV cage" },
      { k: "SOLE", v: "EVA cradle, 24 mm stack" },
      { k: "DROP", v: "6 mm heel-to-toe" },
      { k: "MADE IN", v: "Aurangabad, India" },
    ],
    gallery: [
      img("15", 736, 899),
      { src: "/images/shop/g1.webp", w: 368, h: 216 },
      { src: "/images/shop/g2.webp", w: 397, h: 162 },
      img("24", 736, 920),
    ],
  },
  {
    slug: "hollow-court",
    id: "P-03",
    index: "003",
    name: "HOLLOW COURT “SIGNAL SAND”",
    category: "LOAFER",
    price: 6990,
    colorway: "DUNE / BONE",
    sizes: [41, 42, 43, 44, 45],
    drop: "DROP 03 — 2025",
    short: "Court silhouette sanded down to its last honest muscle.",
    story:
      "A half-court, half-nothing shoe. Wears like a replaced habit.",
    specs: [
      { k: "UPPER", v: "Brushed split leather" },
      { k: "SOLE", v: "Vulcanised rubber herringbone" },
      { k: "MADE IN", v: "Chennai, India" },
    ],
    gallery: [
      img("9", 736, 1313),
      { src: "/images/shop/g3.webp", w: 456, h: 368 },
      img("13", 672, 1195),
      img("7", 540, 720),
    ],
  },
  {
    slug: "meridian-slip",
    id: "P-04",
    index: "004",
    name: "MERIDIAN SLIP “NULL GRID”",
    category: "SLIP-ON",
    price: 5990,
    colorway: "OFF-WHITE / CHALK",
    sizes: [41, 42, 43, 44],
    drop: "DROP 03 — 2025",
    short: "No laces. No noise. Slips on like a decision already made.",
    story:
      "Built twice, worn forever. The Meridian is the slip-on with a spine.",
    specs: [
      { k: "UPPER", v: "Structured 12 oz duck canvas" },
      { k: "LACES", v: "None. Obviously." },
      { k: "MADE IN", v: "Chennai, India" },
    ],
    gallery: [
      img("13", 672, 1195),
      { src: "/images/shop/g4.webp", w: 349, h: 287 },
      img("24", 736, 920),
      img("16", 736, 981),
    ],
  },
  {
    slug: "terra-terra-hiker",
    id: "P-05",
    index: "005",
    name: "TERRA HIKE “RUST OXIDE”",
    category: "HIKER",
    price: 9990,
    colorway: "OXIDE RED",
    sizes: [41, 42, 43, 44, 45, 46],
    drop: "DROP 02 — 2025",
    featured: true,
    short: "Warm as rust, mean as gravel. Hiker DNA on city concrete.",
    story:
      "Satellite’s only survivalist. Suede panels that drink rain for breakfast.",
    specs: [
      { k: "UPPER", v: "Oil-pull suede + 1000D Cordura" },
      { k: "SOLE", v: "Lug outsole, 4.5 mm lugs" },
      { k: "WATER RESIST", v: "DWR treated" },
      { k: "MADE IN", v: "Aurangabad, India" },
    ],
    gallery: [
      img("8", 736, 909),
      { src: "/images/shop/g5.webp", w: 265, h: 136 },
      { src: "/images/shop/g7.webp", w: 368, h: 288 },
      img("10", 736, 1308),
    ],
  },
  {
    slug: "void-chukka",
    id: "P-06",
    index: "006",
    name: "VOID CHUKKA “SMOKE TAN”",
    category: "LOAFER",
    price: 7490,
    colorway: "DUST TAN",
    sizes: [41, 42, 43, 44, 45],
    drop: "DROP 02 — 2025",
    short: "Sits between a chukka and a threat. Comfortable doing both.",
    story:
      "Truckstop poetry in shoe form — tan leather that's ready to scuff.",
    specs: [
      { k: "UPPER", v: "Waxed calf, 1.8 mm" },
      { k: "SOLE", v: "Crepe wedge, 30 mm" },
      { k: "MADE IN", v: "Kanpur, India" },
    ],
    gallery: [
      img("14", 736, 1104),
      { src: "/images/shop/g6.webp", w: 265, h: 243 },
      img("9", 736, 1313),
      img("5", 736, 903),
    ],
  },
  {
    slug: "night-owl-mid",
    id: "P-07",
    index: "007",
    name: "NIGHT OWL MID “STATIC”",
    category: "HIKER",
    price: 8990,
    colorway: "STATIC GREY / NAVY",
    sizes: [40, 41, 42, 43, 44, 46],
    drop: "DROP 01 — 2025",
    short: "After-dark mid. Fights reflections, wins arguments.",
    story:
      "The Night Owl is built for streets that turn off their amiability after 10 PM.",
    specs: [
      { k: "UPPER", v: "Nubuck + ballistic nylon" },
      { k: "SOLE", v: "Dual-density midsole, lugged" },
      { k: "MADE IN", v: "Agra, India" },
    ],
    gallery: [
      img("10", 736, 1308),
      { src: "/images/shop/g21.webp", w: 684, h: 222 },
      img("2", 736, 920),
      img("14", 736, 1104),
    ],
  },
  {
    slug: "phantom-runner-gt",
    id: "P-08",
    index: "008",
    name: "PHANTOM RUNNER GT “OBSIDIAN”",
    category: "RUNNER",
    price: 10990,
    colorway: "OBSIDIAN / ZEBRA LACES",
    sizes: [41, 42, 43, 44, 45],
    drop: "DROP 01 — 2025",
    featured: true,
    short: "The dark collection piece. Neon laces eat the void.",
    story:
      "Seen only when it moves. Matte black stack, loud bone laces — this is the one from the hero film.",
    specs: [
      { k: "UPPER", v: "Matte TPU foam + suede overlays" },
      { k: "SOLE", v: "Chunky 42 mm injected phylon" },
      { k: "LACES", v: "Speckled rope, contrast bone" },
      { k: "MADE IN", v: "Aurangabad, India" },
    ],
    gallery: [
      img("2", 736, 920),
      img("10", 736, 1308),
      img("14", 736, 1104),
      img("8", 736, 909),
    ],
  },
  {
    slug: "vector-runner-s1",
    id: "P-09",
    index: "009",
    name: "VECTOR RUNNER 02 “OBSIDIAN ROPE”",
    category: "RUNNER",
    price: 9290,
    colorway: "OBSIDIAN / ROPE RED",
    sizes: [41, 42, 43, 44, 45, 46],
    drop: "DROP 04 — 2026",
    short: "Laced down and locked in. The dark slab, shot under tension.",
    story:
      "A matte-black runner cinched by red rigging — built for pavements that pull back. Shot mid-tension in the studio.",
    specs: [
      { k: "UPPER", v: "Matte ripstop + suede cage" },
      { k: "SOLE", v: "Segmented cupsole, 38 mm" },
      { k: "WEIGHT", v: "371 g (EU 42)" },
      { k: "MADE IN", v: "Aurangabad, India" },
    ],
    gallery: [
      { src: "/images/shop/s1.webp", w: 338, h: 328 },
      { src: "/images/shop/g8.webp", w: 279, h: 177 },
      { src: "/images/shop/g9.webp", w: 162, h: 184 },
      img("14", 736, 1104),
    ],
  },
  {
    slug: "granite-ridge",
    id: "P-10",
    index: "010",
    name: "GRANITE RIDGE “KHAKI SUMMIT”",
    category: "HIKER",
    price: 8990,
    colorway: "KHAKI / CHOCOLATE",
    sizes: [41, 42, 43, 44, 45],
    drop: "DROP 04 — 2026",
    short: "Stands on rock like it pays rent there. Khaki over chocolate.",
    story:
      "Shot at the summit holding still. Layered khaki suede over a cream saddle, sized for switchbacks and street crossings alike.",
    specs: [
      { k: "UPPER", v: "Two-tone suede + mesh lining" },
      { k: "SOLE", v: "Lugged trail outsole, 4 mm" },
      { k: "WEIGHT", v: "402 g (EU 42)" },
      { k: "MADE IN", v: "Aurangabad, India" },
    ],
    gallery: [
      { src: "/images/shop/d1.webp", w: 265, h: 248 },
      { src: "/images/shop/g10.webp", w: 191, h: 129 },
      { src: "/images/shop/g11.webp", w: 412, h: 221 },
      img("2", 736, 920),
    ],
  },
  {
    slug: "treadwell-01",
    id: "P-11",
    index: "011",
    name: "TREADWELL 01 “EARTH PRINT”",
    category: "RUNNER",
    price: 7490,
    colorway: "CHOCOLATE / GUM",
    sizes: [41, 42, 43, 44, 45, 46],
    drop: "DROP 04 — 2026",
    short: "Reads the ground first. Grip you can set a watch by.",
    story:
      "Lifted straight off the mudline — the Treadwell wears its outsole chart like a signature. Wet stone approved.",
    specs: [
      { k: "UPPER", v: "Suede + ripstop panels" },
      { k: "SOLE", v: "Gum compound trek tread, 4.2 mm" },
      { k: "WEIGHT", v: "349 g (EU 42)" },
      { k: "MADE IN", v: "Aurangabad, India" },
    ],
    gallery: [
      { src: "/images/shop/d2.webp", w: 316, h: 239 },
      { src: "/images/shop/g12.webp", w: 324, h: 239 },
      { src: "/images/shop/g13.webp", w: 294, h: 202 },
      img("2", 736, 920),
    ],
  },
  {
    slug: "dune-court",
    id: "P-12",
    index: "012",
    name: "DUNE COURT “MOON DUST”",
    category: "LOAFER",
    price: 6990,
    colorway: "GREY SUEDE / GUM",
    sizes: [40, 41, 42, 43, 44],
    drop: "DROP 03 — 2025",
    short: "Grey suede that behaves like weather. Court body, dust walk.",
    story:
      "Perforated suede over a gum cupsole — the Dune Court breathes like linen and wears like denim.",
    specs: [
      { k: "UPPER", v: "Perforated grey suede" },
      { k: "SOLE", v: "Gum cupsole, 25 mm" },
      { k: "MADE IN", v: "Chennai, India" },
    ],
    gallery: [
      { src: "/images/shop/d3.webp", w: 316, h: 341 },
      { src: "/images/shop/g14.webp", w: 442, h: 315 },
      { src: "/images/shop/g15.webp", w: 500, h: 315 },
      img("9", 736, 1313),
    ],
  },
  {
    slug: "forest-line",
    id: "P-13",
    index: "013",
    name: "FOREST LINE “PETROL MESH”",
    category: "RUNNER",
    price: 7990,
    colorway: "PINE / GUM",
    sizes: [41, 42, 43, 44, 45],
    drop: "DROP 02 — 2025",
    short: "Pine-green mesh over granite. Breathes like a trailside wind.",
    story:
      "The Forest Line runs where the map stops. Open-weave mesh front, suede guard rails, gum underfoot.",
    specs: [
      { k: "UPPER", v: "Open-weave mesh + suede cage" },
      { k: "SOLE", v: "Gum lug runner, 3.8 mm" },
      { k: "WEIGHT", v: "352 g (EU 42)" },
      { k: "MADE IN", v: "Aurangabad, India" },
    ],
    gallery: [
      { src: "/images/shop/d4.webp", w: 368, h: 392 },
      { src: "/images/shop/g16.webp", w: 412, h: 222 },
      { src: "/images/shop/g17.webp", w: 265, h: 235 },
      img("10", 736, 1308),
    ],
  },
  {
    slug: "altitude-court",
    id: "P-14",
    index: "014",
    name: "ALTITUDE COURT “CLOUD PIERCE”",
    category: "LOAFER",
    price: 7290,
    colorway: "CHALK / ORANGE TAB",
    sizes: [40, 41, 42, 43, 44, 45],
    drop: "DROP 01 — 2025",
    short: "Pierces the cloud deck at ankle height. One orange note.",
    story:
      "A chalk-white court low shot mid-air over a plinth — structured leather, welded seams, one tab of signal orange.",
    specs: [
      { k: "UPPER", v: "Structured leather, welded seams" },
      { k: "SOLE", v: "Stacked rubber, 30 mm" },
      { k: "MADE IN", v: "Chennai, India" },
    ],
    gallery: [
      { src: "/images/shop/d5.webp", w: 316, h: 382 },
      { src: "/images/shop/g18.webp", w: 349, h: 263 },
      { src: "/images/shop/g19.webp", w: 336, h: 227 },
      img("13", 672, 1195),
    ],
  },
  {
    slug: "tundra-walk",
    id: "P-15",
    index: "015",
    name: "TUNDRA WALK “RIVER ROCK”",
    category: "HIKER",
    price: 8490,
    colorway: "KHAKI / CREAM / GUM",
    sizes: [41, 42, 43, 44, 45, 46],
    drop: "DROP 03 — 2025",
    short: "Wet-rock grip with a lace loop that never quite ties down.",
    story:
      "For river crossings and parking lots of equal doubt. Khaki and cream panels over a lugged gum base, waxed cotton lace.",
    specs: [
      { k: "UPPER", v: "Suede + waxed cotton overlays" },
      { k: "SOLE", v: "Lugged gum outsole, 4 mm" },
      { k: "WATER RESIST", v: "DWR treated" },
      { k: "MADE IN", v: "Kanpur, India" },
    ],
    gallery: [
      { src: "/images/shop/d6.webp", w: 309, h: 248 },
      { src: "/images/shop/g20.webp", w: 515, h: 202 },
      img("15", 736, 899),
      img("2", 736, 920),
    ],
  },
];

export const imgOf = img; // re-export helper for inline usage

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const categories = ["RUNNER", "LOAFER", "HIKER", "SLIP-ON"] as const;

export function related(slug: string, n = 4) {
  const p = getProduct(slug);
  if (!p) return [];
  const others = products.filter((x) => x.slug !== slug);
  const same = others.filter((x) => x.category === p.category);
  const rest = others.filter((x) => !same.includes(x));
  return [...same, ...rest].slice(0, n);
}

export const featured = products.filter((p) => p.featured);
