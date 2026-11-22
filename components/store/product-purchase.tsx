"use client";

import { Check, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart";
import type { PublicProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import { WishlistButton } from "./wishlist-button";

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  const h = size === "sm" ? "h-9" : "h-12";
  return (
    <div className={cn("inline-flex items-center rounded-lg border border-gray-300", h)} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} className={cn("grid place-items-center text-navy-900 disabled:text-gray-300", size === "sm" ? "w-8" : "w-11")} aria-label="Decrease quantity">
        <Minus className="size-4" />
      </button>
      <output aria-live="polite" className={cn("text-center font-medium tabular-nums", size === "sm" ? "w-7 text-sm" : "w-9")}>{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} className={cn("grid place-items-center text-navy-900 disabled:text-gray-300", size === "sm" ? "w-8" : "w-11")} aria-label="Increase quantity">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function ProductPurchase({ product }: { product: PublicProduct }) {
  const p = product;
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(p.moq);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = p.availability === "out_of_stock";
  const max = p.source === "local" ? Math.min(99, p.stock) : 99;
  const missing = p.options.filter((o) => !selected[o.name]).map((o) => o.name);

  function addToCart(goToCheckout = false) {
    if (missing.length) {
      setShowErrors(true);
      toast.error(`Please choose ${missing.join(" and ").toLowerCase()} first`);
      document.getElementById(`opt-${missing[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0]!,
      source: p.source,
      options: selected,
      quantity: qty,
      moq: p.moq,
      unitPriceKobo: p.priceKobo,
      unitShippingKobo: p.estShippingKobo,
      estWeightKg: p.estWeightKg,
      deliveryDays: p.deliveryDays,
    });
    if (goToCheckout) {
      router.push("/checkout");
      return;
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    toast.success("Added to cart", {
      description: `${qty} × ${p.name}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
  }

  return (
    <div className="grid gap-5">
      {p.options.map((opt) => {
        const err = showErrors && !selected[opt.name];
        return (
          <fieldset key={opt.name} id={`opt-${opt.name}`} className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">
              {opt.name}
              {selected[opt.name] ? <span className="font-normal text-gray-600">: {selected[opt.name]}</span> : null}
            </legend>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((v) => {
                const on = selected[opt.name] === v;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected((s) => ({ ...s, [opt.name]: v }))}
                    className={cn(
                      "min-w-12 rounded-lg border px-3.5 py-2 text-sm transition-colors",
                      on ? "border-navy-900 bg-navy-900 text-white" : "border-gray-300 hover:border-navy-900",
                      err && "border-red-400",
                    )}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
            {err && <p className="text-sm text-red-600" role="alert">Choose a {opt.name.toLowerCase()} to continue</p>}
          </fieldset>
        );
      })}

      <div className="grid gap-2">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper value={qty} min={p.moq} max={max} onChange={(v) => setQty(Math.max(p.moq, Math.min(max, v)))} />
          {p.moq > 1 && <span className="text-sm text-gray-600">Minimum order: {p.moq}</span>}
          {p.source === "local" && p.stock > 0 && p.stock < 20 && <span className="text-sm font-medium text-orange-600">Only {p.stock} left</span>}
        </div>
      </div>

      {soldOut ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Button size="lg" variant="outline" onClick={() => toast.success("We'll email you when it's back in stock")}>
            Notify me when available
          </Button>
          <WishlistButton slug={p.slug} name={p.name} withLabel />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Button size="lg" variant="accent" onClick={() => addToCart(false)}>
            {justAdded ? <Check className="size-5" aria-hidden /> : <ShoppingCart className="size-5" aria-hidden />}
            {justAdded ? "Added" : "Add to cart"}
          </Button>
          <Button size="lg" onClick={() => addToCart(true)}>
            <Zap className="size-5" aria-hidden />
            Buy now
          </Button>
          <WishlistButton slug={p.slug} name={p.name} withLabel />
        </div>
      )}
    </div>
  );
}
