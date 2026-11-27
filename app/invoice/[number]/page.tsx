import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orders";
import { site } from "@/lib/site";
import { formatDate, formatNaira } from "@/lib/utils";
import { PrintButton } from "./print-button";

type Params = Promise<{ number: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: `Invoice ${(await params).number}`, robots: { index: false, follow: false } };
}

export default async function InvoicePage({ params }: { params: Params }) {
  const order = getOrderByNumber((await params).number);
  if (!order) notFound();
  const t = order.totals;

  return (
    <main className="mx-auto max-w-3xl p-6 sm:p-10 print:p-0">
      <div className="mb-6 flex justify-end gap-2 print:hidden">
        <PrintButton />
      </div>
      <article className="rounded-card border border-gray-200 p-8 print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="" width={66} height={42} className="h-10 w-auto" />
            <div>
              <p className="text-xl font-semibold">Alaba</p>
              <p className="text-sm text-gray-600">{site.address} · {site.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-semibold">Invoice</h1>
            <p className="text-sm text-gray-600">{order.number}</p>
            <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
          </div>
        </header>

        <section className="grid gap-6 py-6 text-sm sm:grid-cols-2">
          <div>
            <h2 className="mb-1 font-semibold">Billed to</h2>
            <p>{order.customerName}<br />{order.email}<br />{order.phone}</p>
          </div>
          <div>
            <h2 className="mb-1 font-semibold">{order.fulfilment === "pickup" ? "Pickup" : "Ship to"}</h2>
            <p>{order.fulfilment === "pickup" ? order.pickupPoint : <>{order.address.line1}<br />{order.address.city}, {order.address.state}</>}</p>
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-200 text-left text-gray-600">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Unit</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.productId} className="border-b border-gray-100">
                <td className="py-2.5 pr-4">{i.name}</td>
                <td className="py-2.5 text-right tabular-nums">{i.quantity}</td>
                <td className="py-2.5 text-right tabular-nums">{formatNaira(i.unitPriceKobo)}</td>
                <td className="py-2.5 text-right tabular-nums">{formatNaira(i.unitPriceKobo * i.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-4 ml-auto grid max-w-xs gap-1.5 text-sm">
          {[
            ["Subtotal", t.itemsKobo],
            ["International shipping & customs", t.intlShippingKobo],
            ["Local delivery", t.localDeliveryKobo],
            ...(t.vatKobo ? [["VAT", t.vatKobo] as const] : []),
            ...(t.balanceDueKobo ? [["Shipping adjustment", t.balanceDueKobo] as const] : []),
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between gap-4">
              <dt className="text-gray-600">{l}</dt>
              <dd className="tabular-nums">{formatNaira(v as number)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatNaira(t.totalKobo)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-gray-600">
            <dt>Paid via Paystack</dt>
            <dd className="tabular-nums">{formatNaira(t.paidKobo)}</dd>
          </div>
        </dl>

        <footer className="mt-10 border-t border-gray-200 pt-4 text-xs text-gray-500">
          Exchange rate at order time: ₦{order.fxRate} per ¥1. Prices in Nigerian naira. Questions? {site.email}
        </footer>
      </article>
    </main>
  );
}
