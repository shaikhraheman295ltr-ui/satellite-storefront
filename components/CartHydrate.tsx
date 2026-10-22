"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

/** Rehydrates localStorage cart once, client-side. */
export default function CartHydrate() {
  const hydrate = useCart((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
