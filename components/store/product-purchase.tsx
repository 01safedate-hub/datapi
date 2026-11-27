"use client";

import { Check, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge, Price } from "@/components/ui/misc";
import { wholesaleUnitKobo } from "@/lib/pricing";
import { useCart } from "@/lib/store/cart";
import type { PublicProduct } from "@/lib/types";
import { cn, formatNaira } from "@/lib/utils";
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
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    // Single-value options need no choice.
    Object.fromEntries(p.options.filter((o) => o.values.length === 1).map((o) => [o.name, o.values[0]!])),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const missing = p.options.filter((o) => !selected[o.name]).map((o) => o.name);
  const variant = missing.length ? null : (p.variants.find((v) => p.options.every((o) => v.options[o.name] === selected[o.name])) ?? null);
  const imported = p.source === "imported";
  const stock = variant ? variant.stock : p.stock;
  const soldOut = p.availability === "out_of_stock" || (variant != null && !imported && variant.stock <= 0);
  const max = imported ? 999 : Math.max(p.moq, Math.min(999, stock));
  const unit = variant?.priceKobo ?? p.priceKobo;
  const effUnit = wholesaleUnitKobo(unit, p.wholesale, qty);
  const priceVaries = new Set(p.variants.map((v) => v.priceKobo)).size > 1;

  /** Is this value still buyable given the other choices? */
  const valueAvailable = (name: string, value: string) =>
    p.variants.some((v) => v.options[name] === value && (imported || v.stock > 0) && Object.entries(selected).every(([k, sv]) => k === name || v.options[k] === sv));
  const priceFor = (name: string, value: string) => {
    const m = p.variants.filter((v) => v.options[name] === value && Object.entries(selected).every(([k, sv]) => k === name || v.options[k] === sv));
    return m.length === 1 ? m[0]!.priceKobo : null;
  };

  function addToCart(goToCheckout = false) {
    if (!variant) {
      setShowErrors(true);
      toast.error(`Please choose ${missing.join(" and ").toLowerCase()} first`);
      document.getElementById(`opt-${missing[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    add({
      productId: p.id,
      variantId: variant.id,
      sku: variant.sku,
      storeId: p.store.id,
      storeName: p.store.name,
      storeSlug: p.store.slug,
      wholesale: p.wholesale,
      freeDelivery: p.freeDelivery,
      stock: imported ? 999 : variant.stock,
      slug: p.slug,
      name: p.name,
      image: p.images[0]!,
      source: p.source,
      options: variant.options,
      quantity: qty,
      moq: p.moq,
      unitPriceKobo: variant.priceKobo,
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
      <div className="grid gap-3 rounded-card border border-gray-200 p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {!variant && priceVaries && <span className="text-sm text-gray-600">From</span>}
          <Price kobo={effUnit} compareAt={effUnit < unit ? unit : (variant?.compareAtKobo ?? p.compareAtKobo)} size="lg" />
          {effUnit < unit && <Badge tone="good">Wholesale price</Badge>}
        </div>
        <dl className="grid gap-1.5 text-sm">
          {imported && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Est. shipping &amp; customs</dt>
              <dd className="font-medium tabular-nums">{formatNaira(p.estShippingKobo)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-gray-600">Delivery</dt>
            <dd className="font-medium">{p.freeDelivery ? <span className="text-green-700">Included in price</span> : "Calculated at checkout (GIG or Jumia)"}</dd>
          </div>
          {qty > 1 && (
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-1.5">
              <dt className="text-gray-600">{qty} items</dt>
              <dd className="font-semibold tabular-nums">{formatNaira(effUnit * qty)}</dd>
            </div>
          )}
        </dl>
        {p.wholesale.length > 0 && (
          <div className="grid gap-2 border-t border-gray-100 pt-3">
            <p className="text-sm font-medium">Buying in bulk?</p>
            <ul className="grid grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))] gap-2">
              {[{ minQty: p.moq, discount: 0 }, ...p.wholesale].map((t) => {
                const on = wholesaleUnitKobo(unit, p.wholesale, qty) === wholesaleUnitKobo(unit, p.wholesale, Math.max(t.minQty, p.moq)) && qty >= t.minQty;
                return (
                  <li key={t.minQty}>
                    <button
                      type="button"
                      onClick={() => setQty(Math.min(max, Math.max(t.minQty, p.moq)))}
                      className={cn("grid w-full rounded-lg border px-3 py-2 text-left text-xs", on ? "border-navy-900 bg-navy-50" : "border-gray-200 hover:border-navy-900")}
                    >
                      <span className="text-gray-600">{t.minQty}+ pcs</span>
                      <span className="text-sm font-semibold tabular-nums">{formatNaira(wholesaleUnitKobo(unit, p.wholesale, Math.max(t.minQty, p.moq)))}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {imported && (
          <p className="text-xs leading-relaxed text-gray-500">
            Shipping is estimated from the supplier&apos;s weight. If the real cost is higher we ask before charging anything; if it&apos;s lower we refund the difference.
          </p>
        )}
      </div>

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
                const ok = valueAvailable(opt.name, v);
                const vp = priceVaries ? priceFor(opt.name, v) : null;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    aria-label={ok ? v : `${v} (sold out)`}
                    onClick={() => setSelected((s) => ({ ...s, [opt.name]: v }))}
                    className={cn(
                      "grid min-w-12 rounded-lg border px-3.5 py-2 text-sm transition-colors",
                      on ? "border-navy-900 bg-navy-900 text-white" : "border-gray-300 hover:border-navy-900",
                      !ok && !on && "border-dashed text-gray-400 line-through",
                      err && "border-red-400",
                    )}
                  >
                    {v}
                    {vp != null && <span className={cn("text-xs tabular-nums", on ? "text-white/80" : "text-gray-500")}>{formatNaira(vp)}</span>}
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
          {!imported && variant && variant.stock > 0 && variant.stock < 20 && <span className="text-sm font-medium text-orange-600">Only {variant.stock} left</span>}
          {variant && <span className="text-xs text-gray-500">SKU {variant.sku}</span>}
        </div>
      </div>

      {soldOut ? (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Button size="lg" variant="outline" onClick={() => toast.success("We'll email you when it's back in stock")}>
            Notify me when available
          </Button>
          <WishlistButton slug={p.slug} name={p.name} withLabel />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_1fr_auto]">
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
