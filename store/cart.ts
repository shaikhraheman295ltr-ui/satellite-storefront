import { create } from "zustand";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  size: number;
  index: string;
  image: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  wish: string[];
  hydrate: () => void;
  persist: () => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string, size: number) => void;
  setQty: (slug: string, size: number, qty: number) => void;
  clear: () => void;
  toggleOpen: (v?: boolean) => void;
  toggleWish: (slug: string) => void;
};

const KEY = "sh-cart-v1";

export const useCart = create<CartState>((set, get) => ({
  items: [],
  open: false,
  wish: [],
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      set({ items: raw.items ?? [], wish: raw.wish ?? [] });
    } catch {}
  },
  persist: () => {
    if (typeof window === "undefined") return;
    const { items, wish } = get();
    localStorage.setItem(KEY, JSON.stringify({ items, wish }));
  },
  add: (item, qty = 1) => {
    const items = [...get().items];
    const i = items.findIndex((x) => x.slug === item.slug && x.size === item.size);
    if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + qty };
    else items.push({ ...item, qty });
    set({ items, open: true });
    get().persist();
  },
  remove: (slug, size) => {
    set({ items: get().items.filter((x) => !(x.slug === slug && x.size === size)) });
    get().persist();
  },
  setQty: (slug, size, qty) => {
    let items = get().items.map((x) =>
      x.slug === slug && x.size === size ? { ...x, qty } : x
    );
    items = items.filter((x) => x.qty > 0);
    set({ items });
    get().persist();
  },
  clear: () => {
    set({ items: [] });
    get().persist();
  },
  toggleOpen: (v) => set({ open: v ?? !get().open }),
  toggleWish: (slug) => {
    const wish = get().wish.includes(slug)
      ? get().wish.filter((s) => s !== slug)
      : [...get().wish, slug];
    set({ wish });
    get().persist();
  },
}));

export const subtotal = (items: CartItem[]) =>
  items.reduce((n, x) => n + x.price * x.qty, 0);
export const cartCount = (items: CartItem[]) =>
  items.reduce((n, x) => n + x.qty, 0);
