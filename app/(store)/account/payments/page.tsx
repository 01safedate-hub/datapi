import Link from "next/link";
import { Badge, Card } from "@/components/ui/misc";
import { getMyOrders } from "@/lib/orders";
import { formatDate, formatNaira } from "@/lib/utils";

export const metadata = { title: "Payments" };

export default function PaymentsPage() {
  const orders = getMyOrders();
  const due = orders.reduce((s, o) => s + o.totals.balanceDueKobo, 0);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-gray-600">Total paid</p>
          <p className="mt-1 text-2xl font-semibold">{formatNaira(orders.reduce((s, o) => s + o.totals.paidKobo, 0))}</p>
        </Card>
        <Card className={due ? "border-orange-500 bg-orange-50 p-5" : "p-5"}>
          <p className="text-sm text-gray-600">Outstanding balance</p>
          <p className="mt-1 text-2xl font-semibold">{formatNaira(due)}</p>
        </Card>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="sr-only">Payment history</caption>
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3"><Link href={`/account/orders/${o.number}`} className="font-medium text-brand-600 hover:underline">{o.number}</Link></td>
                <td className="px-4 py-3 capitalize">{o.provider}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNaira(o.totals.paidKobo)}</td>
                <td className="px-4 py-3">
                  {o.stage === "refunded" ? <Badge tone="bad">Refunded</Badge> : o.totals.balanceDueKobo ? <Badge tone="warn">Balance due</Badge> : <Badge tone="good">Paid</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
