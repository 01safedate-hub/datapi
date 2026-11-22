"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useHydrated } from "@/lib/hooks";
import { useWishlist } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({ slug, name, className, withLabel }: { slug: string; name: string; className?: string; withLabel?: boolean }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const on = useWishlist((s) => s.slugs.includes(slug)) && hydrated;
  const toggle = useWishlist((s) => s.toggle);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(slug);
        toast.success(added ? "Saved to your wishlist" : "Removed from your wishlist", {
          action: added ? { label: "View", onClick: () => router.push("/account/wishlist") } : { label: "Undo", onClick: () => toggle(slug) },
        });
      }}
      className={cn(
        withLabel
          ? "inline-flex h-12 items-center gap-2 rounded-lg border border-gray-300 px-4 font-medium hover:border-navy-900"
          : "grid size-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur hover:bg-white",
        className,
      )}
    >
      <Heart className={cn("size-4.5 transition-colors", on ? "fill-orange-500 text-orange-500" : "text-navy-900")} aria-hidden />
      {withLabel && (on ? "Saved" : "Save")}
    </button>
  );
}
