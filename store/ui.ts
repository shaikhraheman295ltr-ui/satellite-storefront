import { create } from "zustand";

type UIState = {
  autoplay: boolean;
  searchOpen: boolean;
  soundOn: boolean;
  shopCategory: string;
  toggleAutoplay: (v?: boolean) => void;
  toggleSearch: (v?: boolean) => void;
  toggleSound: (v?: boolean) => void;
  setShopCategory: (v: string) => void;
};

export const useUI = create<UIState>((set, get) => ({
  autoplay: true,
  searchOpen: false,
  soundOn: false,
  shopCategory: "",
  toggleAutoplay: (v) => set({ autoplay: v ?? !get().autoplay }),
  toggleSearch: (v) => set({ searchOpen: v ?? !get().searchOpen }),
  toggleSound: (v) => set({ soundOn: v ?? !get().soundOn }),
  setShopCategory: (v) => set({ shopCategory: v }),
}));
