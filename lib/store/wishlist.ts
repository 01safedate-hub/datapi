"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WishlistState = {
  slugs: string[];
  toggle: (slug: string) => boolean;
  has: (slug: string) => boolean;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const on = !get().slugs.includes(slug);
        set({ slugs: on ? [slug, ...get().slugs] : get().slugs.filter((s) => s !== slug) });
        return on;
      },
      has: (slug) => get().slugs.includes(slug),
    }),
    { name: "alaba-wishlist", storage: createJSONStorage(() => localStorage) },
  ),
);
