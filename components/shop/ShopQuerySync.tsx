"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { categories } from "@/data/products";
import { useUI } from "@/store/ui";

/**
 * Keeps the filter state in sync with ?c= while leaving /shop statically
 * rendered (so its metadata ships in the initial HTML).
 */
export default function ShopQuerySync() {
  const searchParams = useSearchParams();
  const setShopCategory = useUI((s) => s.setShopCategory);

  useEffect(() => {
    const requested = searchParams.get("c") ?? "";
    const valid = categories.some((category) => category === requested);
    setShopCategory(valid ? requested : "");
  }, [searchParams, setShopCategory]);

  return null;
}
