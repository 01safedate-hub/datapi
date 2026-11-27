import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge, Price, Rating } from "@/components/ui/misc";
import type { PublicProduct } from "@/lib/types";
import { formatNaira } from "@/lib/utils";
import { WishlistButton } from "./wishlist-button";

export function SourceBadge({ source }: { source: PublicProduct["source"] }) {
  return source === "imported" ? <Badge tone="info">Imported</Badge> : null;
}

export function ProductCard({ product, priority }: { product: PublicProduct; priority?: boolean }) {
  const p = product;
  const soldOut = p.availability === "out_of_stock";
  return (
    <article className="group relative flex flex-col">
      <Link href={`/p/${p.slug}`} className="absolute inset-0 z-10 rounded-card" aria-label={p.name} />
      <div className="relative aspect-square overflow-hidden rounded-card bg-gray-100">
        <Image
          src={p.images[0]!}
          alt=""
          fill
          sizes="(min-width: 1280px) 280px, (min-width: 768px) 25vw, 50vw"
          priority={priority}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          <SourceBadge source={p.source} />
          {p.store.type === "manufacturer" && !p.store.isPlatform && <Badge tone="orange">Manufacturer</Badge>}
          {p.wholesale.length > 0 && <Badge tone="neutral">Wholesale</Badge>}
          {p.availability === "preorder" && <Badge tone="navy">Pre-order</Badge>}
          {soldOut && <Badge tone="bad">Sold out</Badge>}
        </div>
        <WishlistButton slug={p.slug} name={p.name} className="absolute top-2 right-2 z-20" />
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-sm leading-snug font-medium group-hover:underline">{p.name}</h3>
        <Rating value={p.rating} count={p.reviewCount} className="text-xs" />
        <Price kobo={p.priceKobo} compareAt={p.compareAtKobo} size="sm" className="mt-auto pt-1" />
        <p className="flex items-center gap-1 truncate text-xs text-gray-600">
          {p.store.name}
          {p.store.verified && <BadgeCheck className="size-3.5 shrink-0 text-brand-600" aria-label="Verified seller" />}
        </p>
        <p className="text-xs text-gray-500">
          {p.source === "imported" ? (
            <>+ est. {formatNaira(p.estShippingKobo)} shipping · {p.deliveryDays[0]}–{p.deliveryDays[1]} days</>
          ) : (
            <>{p.freeDelivery ? <span className="font-medium text-green-700">Free delivery</span> : "Delivery"} · {p.deliveryDays[0]}–{p.deliveryDays[1]} days</>
          )}
        </p>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: PublicProduct[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
