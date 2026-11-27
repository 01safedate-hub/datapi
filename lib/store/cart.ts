"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Discount, ProductSource, WholesaleTier } from "@/lib/types";

export type CartLine = {
  key: string;
  productId: string;
  variantId: string;
  sku: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  wholesale: WholesaleTier[];
  freeDelivery: boolean;
  stock: number;
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

export const lineKey = (variantId: string) => variantId;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      lastAddedAt: 0,
      add: (line) => {
        const key = lineKey(line.variantId);
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
          lines: get().lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(l.moq, Math.min(l.stock > 0 ? Math.min(l.stock, 999) : 999, quantity)) } : l)),
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
      name: "alaba-cart",
      version: 3,
      migrate: () => ({ lines: [], coupon: null }),
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, coupon: s.coupon }),
    },
  ),
);

/** Cart lines as pricing-engine input. */
export const toQuoteLines = (lines: CartLine[]) =>
  lines.map((l) => ({
    source: l.source,
    storeId: l.storeId,
    unitPriceKobo: l.unitPriceKobo,
    wholesale: l.wholesale,
    unitShippingKobo: l.unitShippingKobo,
    estWeightKg: l.estWeightKg,
    quantity: l.quantity,
    freeDelivery: l.freeDelivery,
  }));

export const cartCount = (lines: CartLine[]) => lines.reduce((s, l) => s + l.quantity, 0);
