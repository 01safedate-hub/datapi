import { Clock, MapPin, MessageCircle, Star } from "lucide-react";
import Link from "next/link";
import type { StoreSummary } from "@/lib/types";
import { SellerTypeBadge, timeOnAlaba, VerifiedTick } from "./seller-badges";

export function SellerCard({ store, productSlug }: { store: StoreSummary; productSlug?: string }) {
  const t = timeOnAlaba(store.joinedAt);
  return (
    <section aria-label="Seller" className="grid gap-3 rounded-card border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid min-w-0 gap-1">
          <p className="text-xs text-gray-500">Sold by</p>
          <Link href={`/store/${store.slug}`} className="flex min-w-0 items-center gap-1.5 font-semibold hover:underline">
            <span className="truncate">{store.name}</span>
            <VerifiedTick verified={store.verified} />
          </Link>
        </div>
        <SellerTypeBadge type={store.type} isPlatform={store.isPlatform} />
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        <li className="flex items-center gap-1"><Star className="size-3.5 fill-sun-400 text-sun-400" aria-hidden />{store.rating.toFixed(1)}</li>
        <li className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{store.city}, {store.state}</li>
        <li className="flex items-center gap-1"><Clock className="size-3.5" aria-hidden />Replies in ~{store.responseHours}h</li>
        <li className={t.isNew ? "font-medium text-orange-600" : undefined}>{t.label}</li>
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <Link href={`/store/${store.slug}`} className="grid h-10 place-items-center rounded-lg border border-gray-300 text-sm font-medium hover:border-navy-900">
          Visit store
        </Link>
        <Link
          href={`/messages?store=${store.slug}${productSlug ? `&product=${productSlug}` : ""}`}
          className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-300 text-sm font-medium hover:border-navy-900"
        >
          <MessageCircle className="size-4" aria-hidden />Chat
        </Link>
      </div>
    </section>
  );
}
