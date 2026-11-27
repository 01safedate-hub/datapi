import { ChevronLeft, FileText, MapPin, Store } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShipmentTracker } from "@/components/store/shipment-tracker";
import { stageTone } from "@/components/store/order-row";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/misc";
import { getMyOrder } from "@/lib/orders";
import { whatsappLink } from "@/lib/site";
import { stageMeta } from "@/lib/stages";
import { formatDate, formatNaira } from "@/lib/utils";
import { BalanceApproval, RequestHelp } from "./order-actions";

type Params = Promise<{ number: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: `Order ${(await params).number}` };
}

export default async function OrderDetailPage({ params }: { params: Params }) {
  const order = getMyOrder((await params).number);
  if (!order) notFound();
  const t = order.totals;
  const canCancel = ["pending_payment", "paid", "sourcing"].includes(order.stage);
  const rows = [
    ["Items", t.itemsKobo],
    ["Shipping & customs", t.intlShippingKobo],
    ["Delivery", t.localDeliveryKobo],
    ...(t.discountKobo ? [["Discount", -t.discountKobo] as const] : []),
    ...(t.balanceDueKobo ? [["Shipping balance (after weighing)", t.balanceDueKobo] as const] : []),
  ] as const;

  return (
    <div className="grid gap-6">
      <Link href="/account/orders" className="inline-flex w-fit items-center gap-1 text-sm text-gray-600 hover:text-navy-900">
        <ChevronLeft className="size-4" aria-hidden /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Order {order.number}</h2>
          <p className="text-sm text-gray-600">Placed {formatDate(order.createdAt)} · Paid with Paystack</p>
        </div>
        <Badge tone={stageTone(order.stage)} className="text-sm">{stageMeta[order.stage].customer}</Badge>
      </div>

      {order.stage === "awaiting_balance" && <BalanceApproval number={order.number} balanceKobo={t.balanceDueKobo} note={order.notes[0]} />}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <Card className="p-5">
            <h3 className="mb-4 font-semibold">Items</h3>
            <ul className="divide-y divide-gray-200">
              {order.items.map((i) => (
                <li key={i.variantId} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">{i.name}</p>
                    {Object.keys(i.options).length > 0 && <p className="text-gray-600">{Object.entries(i.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
                    <p className="text-gray-600">Qty {i.quantity} · {order.storeOrders.find((so) => so.storeId === i.storeId)?.storeName}{i.source === "imported" ? " · Imported" : ""}</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium whitespace-nowrap tabular-nums">{formatNaira(i.unitPriceKobo * i.quantity)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h3 className="mb-5 font-semibold">Tracking</h3>
            <ShipmentTracker order={order} />
          </Card>
        </div>

        <div className="grid gap-6">
          <Card className="p-5">
            <h3 className="mb-4 font-semibold">Payment</h3>
            <dl className="grid gap-2 text-sm">
              {rows.map(([label, v]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-gray-600">{label}</dt>
                  <dd className="tabular-nums">{v < 0 ? `−${formatNaira(-v)}` : formatNaira(v)}</dd>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-t border-gray-200 pt-2 font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatNaira(t.totalKobo)}</dd>
              </div>
              <div className="flex justify-between text-gray-600">
                <dt>Paid</dt>
                <dd className="tabular-nums">{formatNaira(t.paidKobo)}</dd>
              </div>
              {t.balanceDueKobo > 0 && (
                <div className="flex justify-between font-medium text-orange-600">
                  <dt>Balance due</dt>
                  <dd className="tabular-nums">{formatNaira(t.balanceDueKobo)}</dd>
                </div>
              )}
            </dl>
            <ButtonLink href={`/invoice/${order.number}`} variant="outline" size="sm" className="mt-4 w-full" target="_blank">
              <FileText className="size-4" aria-hidden /> View invoice
            </ButtonLink>
          </Card>

          <Card className="p-5 text-sm">
            <h3 className="mb-3 font-semibold">{order.fulfilment === "pickup" ? "Pickup" : "Delivery address"}</h3>
            <p className="flex gap-2">
              {order.fulfilment === "pickup" ? <Store className="size-4.5 shrink-0 text-brand-600" aria-hidden /> : <MapPin className="size-4.5 shrink-0 text-brand-600" aria-hidden />}
              <span>
                {order.customerName}
                <br />
                {order.fulfilment === "pickup" ? order.pickupPoint : <>{order.address.line1}, {order.address.city}, {order.address.state}</>}
                <br />
                {order.phone}
              </span>
            </p>
          </Card>

          <Card className="grid gap-3 p-5">
            <h3 className="font-semibold">Need help?</h3>
            <div className="flex flex-wrap gap-2">
              <RequestHelp number={order.number} canCancel={canCancel} />
              <ButtonLink href={whatsappLink(`Hi Alaba, question about order ${order.number}`)} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer">WhatsApp us</ButtonLink>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
