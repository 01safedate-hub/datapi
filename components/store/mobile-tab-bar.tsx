"use client";

import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/lib/hooks";
import { cartCount, useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/shop", label: "Shop", icon: LayoutGrid, match: (p: string) => p.startsWith("/shop") || p.startsWith("/c/") },
  { href: "/cart", label: "Cart", icon: ShoppingCart, match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout") },
  { href: "/account", label: "Account", icon: User, match: (p: string) => p.startsWith("/account") || p === "/login" },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.lines));
  // Checkout has its own sticky pay bar; keep the screen focused.
  if (pathname.startsWith("/checkout") || pathname.startsWith("/messages")) return null;

  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-safe backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("relative flex h-15 flex-col items-center justify-center gap-0.5 text-[11px] font-medium", active ? "text-navy-900" : "text-gray-500")}
              >
                <Icon className={cn("size-5.5", active && "stroke-[2.25]")} aria-hidden />
                {label}
                {href === "/cart" && hydrated && count > 0 && (
                  <span className="absolute top-1.5 left-1/2 ml-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-navy-950">
                    {count}
                  </span>
                )}
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-navy-900" aria-hidden />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
