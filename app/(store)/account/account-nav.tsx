"use client";

import { CreditCard, Heart, LayoutDashboard, LifeBuoy, LogOut, MapPin, Package, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const items = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/payments", label: "Payments", icon: CreditCard },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/support", label: "Support", icon: LifeBuoy },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const list = useRef<HTMLUListElement>(null);
  // On phones the tabs scroll sideways: keep the current one in view.
  useEffect(() => {
    list.current?.querySelector<HTMLElement>("[aria-current=page]")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);
  const isActive = (href: string) => (href === "/account" ? pathname === href : pathname.startsWith(href));

  return (
    <nav aria-label="Account" className="min-w-0">
      <ul ref={list} className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto scroll-px-4 px-4 lg:mx-0 lg:grid lg:px-0">
        {items.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap",
                isActive(href) ? "bg-navy-900 font-medium text-white" : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <Icon className="size-4.5" aria-hidden />
              {label}
            </Link>
          </li>
        ))}
        <li className="lg:mt-4 lg:border-t lg:border-gray-200 lg:pt-4">
          <button
            type="button"
            onClick={() => {
              toast.success("You've been logged out");
              router.push("/");
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="size-4.5" aria-hidden />
            Log out
          </button>
        </li>
      </ul>
    </nav>
  );
}
