"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Carrier logo. Drop the official files at /public/carriers/gig.svg and
 * /public/carriers/jumia.svg; until then a neutral text mark is shown.
 */
export function CarrierMark({ id, name, short, logo, className }: { id: string; name: string; short: string; logo: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- optional static file; falls back on error
      <img src={logo} alt={name} onError={() => setFailed(true)} className={cn("h-7 w-auto max-w-20 object-contain", className)} />
    );
  }
  return (
    <span
      aria-label={name}
      className={cn(
        "inline-grid h-7 min-w-12 place-items-center rounded-md px-2 text-xs font-bold tracking-wide",
        id === "gig" ? "bg-navy-900 text-white" : "bg-orange-500 text-white",
        className,
      )}
    >
      {short.toUpperCase()}
    </span>
  );
}
