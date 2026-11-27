import { Check, Copy, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { carrierById } from "@/lib/delivery";
import { progressPct, trackShipments } from "@/lib/tracking";
import type { Order } from "@/lib/types";
import { cn, formatDateTime, formatNaira } from "@/lib/utils";
import { CarrierMark } from "./carrier-mark";
import { ConfirmDelivery } from "./confirm-delivery";

/** Detailed per-seller tracking: each shipment gets its own courier, number and milestones. */
export function ShipmentTracker({ order, interactive = true }: { order: Order; interactive?: boolean }) {
  const tracks = trackShipments(order);
  return (
    <div className="grid gap-5">
      {tracks.length > 1 && (
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="size-4 text-brand-600" aria-hidden />
          This order ships in {tracks.length} parts, one from each seller.
        </p>
      )}
      {tracks.map((t, n) => {
        const so = t.storeOrder;
        const c = carrierById(so.carrier);
        const pct = progressPct(t);
        return (
          <section key={so.storeId} aria-label={`Shipment ${n + 1} from ${so.storeName}`} className="grid gap-4 rounded-card border border-gray-200 p-4 sm:p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-0.5">
                <p className="text-xs text-gray-500">Shipment {n + 1} of {tracks.length}{t.imported ? " · Imported" : ""}</p>
                <p className="font-semibold">{so.storeName}</p>
                {so.trackingNumber ? (
                  <p className="flex items-center gap-1.5 text-sm text-gray-700">
                    <Copy className="size-3.5 text-gray-400" aria-hidden />
                    <span className="font-mono">{so.trackingNumber}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Tracking number coming soon</p>
                )}
              </div>
              <div className="grid justify-items-end gap-1">
                <CarrierMark id={c.id} name={c.name} short={c.short} logo={c.logo} />
                <span className="text-xs text-gray-500">{so.freeDelivery ? "Free delivery" : formatNaira(so.deliveryKobo)}</span>
              </div>
            </header>

            <ul className="flex gap-2 overflow-x-auto pb-1">
              {so.itemIndexes.map((i) => {
                const it = order.items[i]!;
                return (
                  <li key={i} className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gray-100" title={`${it.quantity} × ${it.name}`}>
                    <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover" />
                    {it.quantity > 1 && <span className="absolute right-0.5 bottom-0.5 rounded bg-navy-900 px-1 text-[10px] text-white">×{it.quantity}</span>}
                  </li>
                );
              })}
            </ul>

            {t.problem ? (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">This shipment was {order.stage}. Any payment has been returned to you.</p>
            ) : (
              <>
                <div className="grid gap-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Shipment progress">
                    <div className="h-full rounded-full bg-navy-900 transition-[width]" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-500">{t.milestones[Math.min(t.current, t.milestones.length - 1)]?.title}</p>
                </div>
                <ol className="grid">
                  {t.milestones.map((m, i) => {
                    const done = i < t.current;
                    const now = i === t.current;
                    return (
                      <li key={m.key} className="relative flex gap-3.5 pb-5 last:pb-0">
                        {i < t.milestones.length - 1 && <span aria-hidden className={cn("absolute top-6 left-[11px] h-[calc(100%-1.25rem)] w-0.5", done ? "bg-navy-900" : "bg-gray-200")} />}
                        <span className={cn("relative z-10 grid size-6 shrink-0 place-items-center rounded-full border-2", done ? "border-navy-900 bg-navy-900 text-white" : now ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white")}>
                          {done ? <Check className="size-3.5" aria-hidden /> : now ? <span className="size-2 animate-pulse rounded-full bg-orange-500" /> : null}
                        </span>
                        <div className="min-w-0">
                          <p className={cn("text-sm", done ? "font-medium" : now ? "font-semibold" : "text-gray-500")}>
                            {m.title}
                            {now && <span className="sr-only"> (current step)</span>}
                          </p>
                          {(done || now) && <p className="text-xs text-gray-600">{m.detail}</p>}
                          {m.at && done && <p className="text-xs text-gray-400">{formatDateTime(m.at)}</p>}
                          {interactive && now && m.key === "confirmed" && <ConfirmDelivery number={order.number} storeName={so.storeName} />}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </section>
        );
      })}
      <p className="text-xs text-gray-500">
        Sellers are paid only after delivery is confirmed. If you don&apos;t confirm or report a problem within 72 hours of delivery, it confirms automatically.{" "}
        <Link href="/buyer-protection" className="text-brand-600 hover:underline">About Buyer Protection</Link>
      </p>
    </div>
  );
}
