import { WifiOff } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { ReloadButton } from "./reload-button";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="grid max-w-sm justify-items-center gap-4">
        <Logo />
        <WifiOff className="mt-6 size-10 text-navy-700" aria-hidden />
        <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
        <p className="text-gray-600">Check your data or Wi-Fi. Your cart and wishlist are saved on this device and will be here when you&apos;re back.</p>
        <ReloadButton />
      </div>
    </main>
  );
}
