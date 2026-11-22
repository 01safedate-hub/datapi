"use client";

import { ArrowRight, Lock, Plane, ShoppingBag, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { QuantityStepper } from "@/components/store/product-purchase";
import { CouponForm, SummaryRows } from "@/components/store/order-summary";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Callout, Card, EmptyState, Skeleton } from "@/components/ui/misc";
import { useHydrated } from "@/lib/hooks";
import { quote } from "@/lib/pricing";
import { cartCount, useCart, type CartLine } from "@/lib/store/cart";
import { formatNaira } from "@/lib/utils";

function Line({ line }: { line: CartLine }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const restore = useCart((s) => s.restore);
  const opts = Object.entries(line.options);

  return (
    <li className="flex gap-4 py-5">
      <Link href={`/p/${line.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:size-28">
        <Image src={line.image} alt="" fill sizes="112px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/p/${line.slug}`} className="line-clamp-2 font-medium hover:underline">{line.name}</Link>
          <p className="shrink-0 font-semibold tabular-nums">{formatNaira(line.unitPriceKobo * line.quantity)}</p>
        </div>
        {opts.length > 0 && <p className="text-sm text-gray-600">{opts.map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          {line.source === "imported" ? <Badge tone="info">Imported</Badge> : <Badge tone="orange">Local</Badge>}
          <span>Arrives in {line.deliveryDays[0]}–{line.deliveryDays[1]} days</span>
          {line.source === "imported" && <span>· est. {formatNaira(line.unitShippingKobo * line.quantity)} shipping</span>}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <QuantityStepper size="sm" value={line.quantity} min={line.moq} onChange={(v) => setQuantity(line.key, v)} label={`Quantity for ${line.name}`} />
          <button
            type="button"
            onClick={() => {
              const removed = remove(line.key);
              if (removed) toast("Removed from cart", { description: removed.name, action: { label: "Undo", onClick: () => restore(removed) } });
            }}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-red-600"
          >
            <Trash2 className="size-4" aria-hidden />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

export function CartView() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);

  if (!hydrated) {
    return (
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_380px]">
        <Skeleton className="h-80" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-page py-8">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Find something you love. Your cart is saved on this device, even offline."
          action={
            <>
              <ButtonLink href="/shop" variant="accent">Start shopping</ButtonLink>
              <ButtonLink href="/account/wishlist" variant="outline">View wishlist</ButtonLink>
            </>
          }
        />
      </div>
    );
  }

  const q = quote(lines, null, coupon);
  const imported = lines.filter((l) => l.source === "imported");
  const local = lines.filter((l) => l.source === "local");

  return (
    <div className="container-page py-6 sm:py-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">Cart <span className="text-lg font-normal text-gray-500">({cartCount(lines)} items)</span></h1>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          {imported.length > 0 && local.length > 0 && (
            <Callout title="Your order will arrive in two parts">
              Local items ship in 1–4 days. Imported items follow when they land in Lagos. Delivery is charged once.
            </Callout>
          )}
          {[
            { title: "Imported from China", icon: Plane, items: imported },
            { title: "Local stock, Lagos", icon: Truck, items: local },
          ]
            .filter((g) => g.items.length)
            .map((g) => (
              <Card key={g.title} className="px-5">
                <h2 className="flex items-center gap-2 border-b border-gray-200 py-4 font-semibold">
                  <g.icon className="size-4.5 text-brand-600" aria-hidden />
                  {g.title}
                </h2>
                <ul className="divide-y divide-gray-200">
                  {g.items.map((l) => <Line key={l.key} line={l} />)}
                </ul>
              </Card>
            ))}
        </div>

        <Card className="sticky top-36 grid gap-5 p-5">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <SummaryRows q={q} deliveryKnown={false} />
          <CouponForm itemsKobo={q.itemsKobo} />
          <ButtonLink href="/checkout" variant="accent" size="lg" className="w-full">
            Checkout <ArrowRight className="size-4.5" aria-hidden />
          </ButtonLink>
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Lock className="size-3.5" aria-hidden /> Secure checkout · Guest checkout available
          </p>
        </Card>
      </div>
    </div>
  );
}
