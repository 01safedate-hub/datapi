"use client";

import { MessageCircle, WifiOff } from "lucide-react";
import { usePathname } from "next/navigation";
import { useOnline } from "@/lib/hooks";
import { whatsappLink } from "@/lib/site";

/** Always-available help: a WhatsApp button that knows which page you're on. */
export function WhatsAppFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/checkout") || pathname.startsWith("/messages")) return null;
  // Account and cart pages have their own help links; on phones the floating button would cover their buttons.
  const hideOnPhone = pathname.startsWith("/account") || pathname.startsWith("/cart");
  return (
    <a
      href={whatsappLink(`Hi Alaba, I need help (page: ${pathname})`)}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-4 bottom-20 z-30 ${hideOnPhone ? "hidden md:flex" : "flex"} h-12 items-center gap-2 rounded-full bg-navy-900 pr-4 pl-3.5 text-sm font-medium text-white shadow-drawer transition-transform hover:-translate-y-0.5 md:bottom-6`}
      aria-label="Chat with support on WhatsApp"
    >
      <MessageCircle className="size-5 text-orange-500" aria-hidden />
      <span className="hidden sm:inline">Need help?</span>
    </a>
  );
}

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm text-amber-900">
      <WifiOff className="size-4" aria-hidden />
      You&apos;re offline. Your cart is saved — we&apos;ll reconnect automatically.
    </div>
  );
}
