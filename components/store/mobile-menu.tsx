"use client";

import { BadgeCheck, ChevronRight, Factory, HelpCircle, Menu, MessageCircle, Package, Store, Truck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import type { Category } from "@/lib/types";

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  // Close the drawer when the route changes.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  const links = [
    { href: "/account/orders", label: "My orders", icon: Package },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/manufacturers", label: "Manufacturers", icon: Factory },
    { href: "/brands", label: "Brands", icon: BadgeCheck },
    { href: "/sell", label: "Sell on Alaba", icon: Store },
    { href: "/track", label: "Track an order", icon: Truck },
    { href: "/account", label: "Account", icon: User },
    { href: "/faq", label: "Help & FAQ", icon: HelpCircle },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-lg hover:bg-gray-100 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Menu" side="left">
        <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">Shop</p>
        <ul className="-mx-2 mb-6 grid">
          <li>
            <Link href="/shop" className="flex items-center justify-between rounded-lg px-2 py-2.5 font-medium hover:bg-gray-50">
              All products <ChevronRight className="size-4 text-gray-400" aria-hidden />
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/c/${c.slug}`} className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-gray-50">
                {c.name} <ChevronRight className="size-4 text-gray-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">You</p>
        <ul className="-mx-2 grid">
          {links.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-gray-50">
                <Icon className="size-5 text-navy-700" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
