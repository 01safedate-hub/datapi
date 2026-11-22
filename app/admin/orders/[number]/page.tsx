import { ChevronLeft, FileText, Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StageBadge } from "@/components/admin/ui";
import { OrderTimeline } from "@/components/order-timeline";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/misc";
import { getOrderByNumber, hasImported } from "@/lib/orders";
import { nextStages } from "@/lib/stages";
import { formatDateTime, formatNaira, formatRmb } from "@/lib/utils";
import { InternalNotes, RefundButton, StageMover } from "./order-controls";

type Params = Promise<{ number: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: `Order ${(await params).number}` };
}

export default async function AdminOrderPage({ params }: { params: Params }) {
  const o = getOrderByNumber((await params).number);
  if (!o) notFound();
  const t = o.totals;
  const c = o.costs;
  const costTotal = c.supplierKobo + c.intlShippingKobo + c.localDeliveryKobo + t.gatewayFeeKobo;
  const profit = t.paidKobo - costTotal;

  return (
    <>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-navy-900"><ChevronLeft className="size-4" aria-hidden /> Orders</Link>
      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{o.number}</h1>
          <StageBadge stage={o.stage} />
          {!o.customerId && <Badge>Guest</Badge>}
        </div>
        <div className="flex gap-2">
          <ButtonLink href={`/invoice/${o.number}`} target="_blank" variant="outline" size="sm"><FileText className="size-4" aria-hidden /> Invoice</ButtonLink>
          <RefundButton number={o.number} paidKobo={t.paidKobo} />
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <caption className="sr-only">Items</caption>
              <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs tracking-wide text-gray-600 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 text-right font-medium">Qty</th>
                  <th className="px-4 py-3 text-right font-medium">Supplier cost</th>
                  <th className="px-4 py-3 text-right font-medium">Est. kg</th>
                  <th className="px-4 py-3 text-right font-medium">Sold at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {o.items.map((i) => (
                  <tr key={i.productId}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Image src={i.image} alt="" width={40} height={40} className="size-10 rounded-md bg-gray-100" />
                        <div>
                          <p className="font-medium">{i.name}</p>
                          <p className="text-xs text-gray-500">{[i.source === "imported" ? "Imported" : "Local", ...Object.values(i.options)].join(" · ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{i.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{i.supplierCostFen ? formatRmb(i.supplierCostFen) : "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{i.estWeightKg}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNaira(i.unitPriceKobo * i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Financial breakdown</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <dl className="grid content-start gap-2 text-sm">
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Customer paid</p>
                {[["Items", t.itemsKobo], ["Intl shipping (charged)", t.intlShippingKobo], ["Local delivery (charged)", t.localDeliveryKobo], ["Discount", -t.discountKobo]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between"><dt className="text-gray-600">{l}</dt><dd className="tabular-nums">{formatNaira(v as number)}</dd></div>
                ))}
                <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold"><dt>Paid</dt><dd className="tabular-nums">{formatNaira(t.paidKobo)}</dd></div>
                {t.balanceDueKobo > 0 && <div className="flex justify-between text-orange-600"><dt>Balance due</dt><dd className="tabular-nums">{formatNaira(t.balanceDueKobo)}</dd></div>}
              </dl>
              <dl className="grid content-start gap-2 text-sm">
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Our costs</p>
                {[["Supplier (at ₦" + o.fxRate + "/¥)", c.supplierKobo], ["Air freight & clearance", c.intlShippingKobo], ["Courier", c.localDeliveryKobo], [`${o.provider === "paystack" ? "Paystack" : "Flutterwave"} fee`, t.gatewayFeeKobo]].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between"><dt className="text-gray-600">{l}</dt><dd className="tabular-nums">{formatNaira(v as number)}</dd></div>
                ))}
                <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                  <dt>Profit</dt>
                  <dd className={profit >= 0 ? "text-green-700 tabular-nums" : "text-red-600 tabular-nums"}>{formatNaira(profit)} ({t.paidKobo ? Math.round((profit / t.paidKobo) * 100) : 0}%)</dd>
                </div>
              </dl>
            </div>
            <p className="mt-4 text-xs text-gray-500">Rates are frozen at order time (FX ₦{o.fxRate}/¥1), so later price changes never rewrite this order.</p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-5 font-semibold">Timeline</h2>
            <OrderTimeline order={o} audience="admin" />
          </Card>
        </div>

        <div className="grid gap-6">
          <StageMover number={o.number} stage={o.stage} next={nextStages(o.stage, hasImported(o), o.fulfilment)} />
          <Card className="grid gap-3 p-5 text-sm">
            <h2 className="font-semibold">Customer</h2>
            <p className="font-medium">{o.customerName}</p>
            <a href={`mailto:${o.email}`} className="flex items-center gap-2 text-brand-600 hover:underline"><Mail className="size-4" aria-hidden />{o.email}</a>
            <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-brand-600 hover:underline"><Phone className="size-4" aria-hidden />{o.phone}</a>
            <a href={`https://wa.me/${o.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-600 hover:underline"><MessageCircle className="size-4" aria-hidden />WhatsApp</a>
            <p className="text-gray-600">{o.fulfilment === "pickup" ? `Pickup: ${o.pickupPoint}` : `${o.address.line1}, ${o.address.city}, ${o.address.state}`}</p>
            <p className="text-xs text-gray-500">Placed {formatDateTime(o.createdAt)} · {o.provider} · Assigned to {o.assignedTo ?? "nobody"}</p>
          </Card>
          <InternalNotes initial={o.notes} />
        </div>
      </div>
    </>
  );
}
