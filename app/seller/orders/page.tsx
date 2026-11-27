import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { CarrierMark } from "@/components/store/carrier-mark";
import { Badge, Card, EmptyState } from "@/components/ui/misc";
import { carrierById } from "@/lib/delivery";
import { demoSellerStoreId, payoutLabel, sellerOrders } from "@/lib/marketplace";
import { stageMeta } from "@/lib/stages";
import { formatDate, formatNaira } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

export const metadata = { title: "Orders" };

export default function SellerOrdersPage() {
  const rows = sellerOrders(demoSellerStoreId);
  return (
    <>
      <PageHeader title="Orders" description="Only your part of each order is shown. Buyers' contact details are shared with the courier, not with you." />
      {rows.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No orders yet" description="Orders for your products will appear here." />
      ) : (
        <ul className="grid gap-3">
          {rows.map(({ order: o, so }) => {
            const c = carrierById(so.carrier);
            return (
              <li key={o.number}>
                <Card className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="grid gap-1">
                    <p className="font-medium">{o.number} <span className="font-normal text-gray-500">· {formatDate(o.createdAt)} · to {o.address.state}</span></p>
                    <p className="text-sm text-gray-700">{so.itemIndexes.map((i) => `${o.items[i]!.quantity} × ${o.items[i]!.name}${Object.keys(o.items[i]!.options).length ? ` (${Object.values(o.items[i]!.options).join(", ")})` : ""}`).join(" · ")}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge>{stageMeta[o.stage].label}</Badge>
                      <Badge tone={payoutLabel[so.payout].tone}>{payoutLabel[so.payout].label}</Badge>
                      <span className="flex items-center gap-1.5"><CarrierMark id={c.id} name={c.name} short={c.short} logo={c.logo} className="h-5" />{so.trackingNumber ?? "Awaiting pickup"}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold tabular-nums">{formatNaira(so.subtotalKobo - so.commissionKobo)}</p>
                    <p className="text-xs text-gray-500">after {formatNaira(so.commissionKobo)} commission</p>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-xs text-gray-500">Need to print a waybill? <Link href="/contact" className="text-brand-600 hover:underline">Contact seller support</Link>.</p>
    </>
  );
}
