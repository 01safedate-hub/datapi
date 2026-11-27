import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Alaba logo: the A-cart mark plus the wordmark. */
export function Logo({ className, href = "/", label = true, tone = "dark" }: { className?: string; href?: string; label?: boolean; tone?: "dark" | "light" }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 rounded-lg", className)} aria-label="Alaba home">
      <Image src="/logo.png" alt="" width={56} height={36} priority className="h-9 w-auto" />
      {label && <span className={cn("text-[22px] font-bold tracking-tight", tone === "light" ? "text-white" : "text-navy-900")}>Alaba</span>}
    </Link>
  );
}
