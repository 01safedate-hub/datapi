"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useHydrated } from "@/lib/hooks";
import { cartCount, useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

export function CartButton() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const bump = useCart((s) => s.lastAddedAt);
  const count = hydrated ? cartCount(lines) : 0;

  return (
    <Link
      href="/cart"
      className="relative grid size-10 place-items-center rounded-lg hover:bg-gray-100"
      aria-label={count ? `Cart, ${count} items` : "Cart, empty"}
    >
      <ShoppingCart className="size-5" aria-hidden />
      {count > 0 && (
        <span
          key={bump}
          className={cn(
            "absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-orange-500 px-1 text-[11px] font-semibold text-navy-950",
            bump && "animate-bump",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
