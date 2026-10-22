/**
 * Payment integration placeholders — Razorpay first (India), Stripe ready.
 * Add keys to `.env.local` when wiring a real backend:
 *   RAZORPAY_KEY_ID=...
 *   RAZORPAY_KEY_SECRET=...
 *   NEXT_PUBLIC_RAZORPAY_KEY_ID=...
 */

export type PaymentProvider = "razorpay" | "stripe" | "cod";

export type OrderDraft = {
  items: { slug: string; size: number; qty: number; price: number }[];
  customer: { name: string; email: string; phone: string };
  address: { line1: string; city: string; state: string; pin: string; country: string };
  amount: number; // INR, minor units handled below
  currency: "INR";
};

/** Razorpay wants paise, not rupees. */
export const toMinorUnits = (inr: number) => Math.round(inr * 100);

/**
 * Server-side order creation stub. Replace `fetch` target with your API route
 * (`/api/razorpay/order`) once keys exist — never expose the secret client-side.
 */
export async function createRazorpayOrder(order: OrderDraft) {
  const payload = {
    amount: toMinorUnits(order.amount),
    currency: order.currency,
    receipt: `sh_${Date.now()}`,
    notes: {
      items: order.items.map((i) => `${i.slug}:${i.size}x${i.qty}`).join(","),
      email: order.customer.email,
    },
  };
  // return fetch("/api/razorpay/order", { method: "POST", body: JSON.stringify(payload) }).then(r => r.json());
  return { demo: true, payload };
}

export const RAZORPAY_KEY_PLACEHOLDER = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "rzp_test_XXXXXXXXXXXX";
