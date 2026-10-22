import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Checkout — SATELLITE®",
  description: "Secure checkout — Razorpay UPI, cards and COD. Free shipping across India.",
  path: "/checkout",
  noindex: true,
  follow: false,
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
