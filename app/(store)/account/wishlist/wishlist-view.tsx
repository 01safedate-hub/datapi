"use client";

import { Heart } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { useHydrated } from "@/lib/hooks";
import { useWishlist } from "@/lib/store/wishlist";
import type { PublicProduct } from "@/lib/types";

export function WishlistView({ products }: { products: PublicProduct[] }) {
  const hydrated = useHydrated();
  const slugs = useWishlist((s) => s.slugs);
  if (!hydrated) return <Skeleton className="h-72" />;

  const saved = slugs.map((s) => products.find((p) => p.slug === s)).filter((p): p is PublicProduct => !!p);
  if (!saved.length) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it for later."
        action={<ButtonLink href="/shop" variant="accent">Browse products</ButtonLink>}
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
      {saved.map((p) => (
        <li key={p.id}><ProductCard product={p} /></li>
      ))}
    </ul>
  );
}
