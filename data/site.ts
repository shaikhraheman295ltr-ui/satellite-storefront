const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");

export const site = {
  name: "SATELLITE",
  tagline: "SNEAKERS BUILT FROM MOTION",
  description:
    "SATELLITE is a footwear studio making limited-run sneakers with a scroll-driven 3D experience. Built for movement, cut from reality.",
  domain: configuredSiteUrl || "https://satellite.example.com",
  currency: "INR",
  locale: "en-IN",
  contact: {
    email: "hello@satellite.in",
    phone: "+91 22 4000 0000",
    address: "Studio 402, Raghuleela Estate, Andheri West, Mumbai 400053",
    hours: "MON–FRI 10:00–19:00 IST",
  },
  social: [
    { label: "IG", href: "https://instagram.com" },
    { label: "X", href: "https://x.com" },
    { label: "YT", href: "https://youtube.com" },
  ],
};

export const manifesto = [
  "WE MAKE FOOTWEAR FOR THE ONES WHO MOVE THROUGH CITIES LIKE THEY OWE NOBODY AN EXPLANATION.",
  "EVERY PAIR STARTS AS MOTION DATA — WALK CYCLES, SPRINT STRIDES, COFFEE-SHAFFLE WATCH REPAIR RUNS — THEN GETS CUT, LASTED AND STITCHED INTO A QUIET OBJECT THAT ONLY SPEAKS WHEN IT ROCKS.",
  "NO SEASONAL NOISE. NO RENDERED LUXURY. RAW TECH, HONEST SUEDE, SOLES THAT ARGUE BACK.",
];
