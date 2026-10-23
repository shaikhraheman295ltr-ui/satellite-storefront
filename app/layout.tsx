import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CartHydrate from "@/components/CartHydrate";
import SearchOverlay from "@/components/SearchOverlay";
import Cursor from "@/components/Cursor";
import Preloader from "@/components/Preloader";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: "SATELLITE® — Sneakers Built From Motion",
    template: "%s — SATELLITE®",
  },
  description: site.description,
  keywords: [
    "sneakers",
    "footwear",
    "made in India",
    "limited run",
    "scroll experience",
    "Mumbai",
  ],
  authors: [{ name: "SATELLITE Studio" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SATELLITE®",
    title: "SATELLITE® — Sneakers Built From Motion",
    description: site.description,
    images: [
      {
        url: "/images/hero-poster.webp",
        width: 1280,
        height: 720,
        alt: "SATELLITE Phantom Runner GT — hero film still",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SATELLITE® — Sneakers Built From Motion",
    description: site.description,
    images: ["/images/hero-poster.webp"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* cover lets fixed UI tuck into notch/home-indicator insets (see safe-area
     paddings) and is what "add to home screen" installs expect. */
  viewportFit: "cover",
  /* Android: viewport resizes when the keyboard opens instead of the fixed
     overlay floating untouched above it. */
  interactiveWidget: "resizes-content",
  themeColor: "#F2F0EB",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-body`}
      >
        <Preloader />
        <CartHydrate />
        <SmoothScroll />
        <Cursor />
        <Navbar />
        <SearchOverlay />
        <CartDrawer />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
