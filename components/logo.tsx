import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/", label = true }: { className?: string; href?: string; label?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 rounded-lg", className)} aria-label="Shupzy home">
      <Image src="/logo-mark.png" alt="" width={36} height={36} priority className="size-9" />
      {label && <span className="text-xl font-semibold tracking-tight text-navy-900">Shupzy</span>}
    </Link>
  );
}
