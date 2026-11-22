"use client";

import { ExternalLink, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { adminNav } from "./nav";

function NavList({ counts }: { counts: Record<string, number> }) {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/admin" ? pathname === href : href === "/admin/products" ? pathname === href || /^\/admin\/products\/(?!import)/.test(pathname) : pathname.startsWith(href);

  return (
    <nav aria-label="Admin" className="grid gap-5">
      {adminNav.map((g) => (
        <div key={g.title || "main"}>
          {g.title && <p className="mb-1.5 px-3 text-[11px] font-medium tracking-wider text-white/45 uppercase">{g.title}</p>}
          <ul className="grid gap-0.5">
            {g.items.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active(href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active(href) ? "bg-white/12 font-medium text-white" : "text-white/70 hover:bg-white/6 hover:text-white",
                  )}
                >
                  <Icon className="size-4.5" aria-hidden />
                  <span className="flex-1">{label}</span>
                  {counts[href] ? <span className="rounded-full bg-orange-500 px-1.5 text-[11px] font-semibold text-navy-950">{counts[href]}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 px-3">
      <span className="grid size-8 place-items-center rounded-lg bg-white">
        <Image src="/logo-mark.png" alt="" width={24} height={24} />
      </span>
      <span className="font-semibold text-white">Shupzy <span className="font-normal text-white/50">Admin</span></span>
    </Link>
  );
}

export function AdminShell({ children, counts }: { children: React.ReactNode; counts: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [last, setLast] = useState(pathname);
  if (pathname !== last) {
    setLast(pathname);
    if (open) setOpen(false);
  }

  return (
    <div className="min-h-dvh bg-gray-50 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 overflow-y-auto bg-navy-900 px-3 py-5 lg:flex">
        <Brand />
        <NavList counts={counts} />
        <Link href="/" target="_blank" className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white">
          <ExternalLink className="size-4" aria-hidden /> View store
        </Link>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg hover:bg-gray-100" aria-label="Open admin menu">
            <Menu className="size-5" />
          </button>
          <span className="font-semibold">Shupzy Admin</span>
        </header>
        <main id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Menu" side="left">
        <div className="-mx-5 -my-4 min-h-full bg-navy-900 px-3 py-5">
          <NavList counts={counts} />
        </div>
      </Sheet>
    </div>
  );
}
