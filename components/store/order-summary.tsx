"use client";

import { Info, Tag, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { applyCoupon } from "@/app/(store)/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import type { Quote } from "@/lib/pricing";
import { useCart } from "@/lib/store/cart";
import { cn, formatNaira } from "@/lib/utils";

export function SummaryRows({ q, deliveryKnown }: { q: Quote; deliveryKnown: boolean }) {
  const rows = [
    { label: "Items", value: formatNaira(q.itemsKobo) },
    ...(q.hasImported
      ? [{ label: "Est. shipping & customs", value: formatNaira(q.intlShippingKobo), hint: "Confirmed when we weigh your item in China. We never charge more without asking." }]
      : []),
    { label: "Delivery", value: deliveryKnown ? (q.localDeliveryKobo ? formatNaira(q.localDeliveryKobo) : "Free") : "Calculated at checkout" },
    ...(q.serviceFeeKobo ? [{ label: "Service fee", value: formatNaira(q.serviceFeeKobo) }] : []),
    ...(q.vatKobo ? [{ label: "VAT (7.5%)", value: formatNaira(q.vatKobo) }] : []),
  ];
  return (
    <dl className="grid gap-2.5 text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex items-start justify-between gap-4">
          <dt className="flex items-center gap-1 text-gray-600">
            {r.label}
            {"hint" in r && r.hint && (
              <span className="group relative">
                <Info className="size-3.5 cursor-help" aria-label={r.hint} tabIndex={0} />
                <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-navy-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  {r.hint}
                </span>
              </span>
            )}
          </dt>
          <dd className={cn("text-right font-medium tabular-nums", r.value === "Calculated at checkout" && "font-normal text-gray-500")}>{r.value}</dd>
        </div>
      ))}
      {q.discountKobo > 0 && (
        <div className="flex justify-between gap-4 text-green-700">
          <dt>Discount</dt>
          <dd className="font-medium tabular-nums">−{formatNaira(q.discountKobo)}</dd>
        </div>
      )}
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-gray-200 pt-3">
        <dt className="font-semibold">Total</dt>
        <dd className="text-xl font-semibold tabular-nums">{formatNaira(q.totalKobo)}</dd>
      </div>
    </dl>
  );
}

export function CouponForm({ itemsKobo }: { itemsKobo: number }) {
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
        <span className="flex items-center gap-2 font-medium"><Tag className="size-4" aria-hidden />{coupon.code}</span>
        <button type="button" onClick={() => { setCoupon(null); toast("Discount code removed"); }} className="grid size-7 place-items-center rounded-md hover:bg-green-100" aria-label="Remove discount code">
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await applyCoupon(code, itemsKobo);
          if (res.ok) {
            setCoupon(res.discount);
            setError(null);
            setCode("");
            toast.success(res.message);
          } else setError(res.message);
        });
      }}
      className="grid gap-1.5"
    >
      <label htmlFor="coupon" className="text-sm font-medium">Discount code</label>
      <div className="flex gap-2">
        <Input id="coupon" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }} placeholder="e.g. WELCOME10" aria-invalid={!!error} aria-describedby={error ? "coupon-error" : undefined} className="h-10 uppercase" />
        <Button type="submit" variant="outline" className="h-10" loading={pending} disabled={!code.trim()}>Apply</Button>
      </div>
      {error && <p id="coupon-error" role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
