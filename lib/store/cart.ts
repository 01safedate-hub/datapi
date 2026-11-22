"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Discount, ProductSource } from "@/lib/types";

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  source: ProductSource;
  options: Record<string, string>;
  quantity: number;
  moq: number;
  unitPriceKobo: number;
  unitShippingKobo: number;
  estWeightKg: number;
  deliveryDays: [number, number];
};

type CartState = {
  lines: CartLine[];
  coupon: Discount | null;
  lastAddedAt: number;
  add: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => CartLine | undefined;
  restore: (line: CartLine) => void;
  setCoupon: (discount: Discount | null) => void;
  clear: () => void;
};

export const lineKey = (productId: string, options: Record<string, string>) =>
  `${productId}:${Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("|")}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      lastAddedAt: 0,
      add: (line) => {
        const key = lineKey(line.productId, line.options);
        const existing = get().lines.find((l) => l.key === key);
        set({
          lastAddedAt: Date.now(),
          lines: existing
            ? get().lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l))
            : [...get().lines, { ...line, key }],
        });
      },
      setQuantity: (key, quantity) =>
        set({
          lines: get().lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(l.moq, Math.min(99, quantity)) } : l)),
        }),
      remove: (key) => {
        const line = get().lines.find((l) => l.key === key);
        set({ lines: get().lines.filter((l) => l.key !== key) });
        return line;
      },
      restore: (line) => set({ lines: [...get().lines.filter((l) => l.key !== line.key), line] }),
      setCoupon: (coupon) => set({ coupon }),
      clear: () => set({ lines: [], coupon: null }),
    }),
    {
      name: "shupzy-cart",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, coupon: s.coupon }),
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((s, l) => s + l.quantity, 0);
