import { BadgeCheck, Factory, Store as StoreIcon } from "lucide-react";
import { Badge } from "@/components/ui/misc";
import type { SellerType } from "@/lib/types";

export function SellerTypeBadge({ type, isPlatform }: { type: SellerType; isPlatform?: boolean }) {
  if (isPlatform) return <Badge tone="navy"><BadgeCheck className="size-3.5" aria-hidden />Alaba Verified</Badge>;
  return type === "manufacturer" ? (
    <Badge tone="orange"><Factory className="size-3.5" aria-hidden />Manufacturer</Badge>
  ) : (
    <Badge tone="info"><StoreIcon className="size-3.5" aria-hidden />Vendor</Badge>
  );
}

export function VerifiedTick({ verified, className }: { verified: boolean; className?: string }) {
  if (!verified) return null;
  return <BadgeCheck className={className ?? "size-4 text-brand-600"} aria-label="Verified by Alaba" />;
}

export function timeOnAlaba(joinedAt: string, now = Date.parse("2026-11-27T00:00:00Z")) {
  const days = Math.max(0, Math.round((now - Date.parse(joinedAt)) / 86_400_000));
  if (days < 30) return { label: `${days} days on Alaba`, isNew: true };
  const months = Math.round(days / 30);
  return months < 12 ? { label: `${months} month${months === 1 ? "" : "s"} on Alaba`, isNew: months < 2 } : { label: `${Math.floor(months / 12)}+ years on Alaba`, isNew: false };
}
