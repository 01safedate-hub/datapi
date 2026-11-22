import { AlertTriangle, ArrowRight, Banknote, ClipboardList, LifeBuoy, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { DataTable, PageHeader, StageBadge, StatCard } from "@/components/admin/ui";
import { Card } from "@/components/ui/misc";
import { dailyRevenue, orders, tickets } from "@/lib/data/ops";
import { pricingSettings } from "@/lib/data/settings";
import { stageMeta } from "@/lib/stages";
import type { Order, OrderStage } from "@/lib/types";
import { formatDateTime, formatNaira } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const pipeline: OrderStage[] = ["paid", "sourcing", "purchased", "china_warehouse", "awaiting_balance", "dispatched", "arrived_ng", "customs_cleared", "ng_warehouse", "out_for_delivery", "ready_for_pickup"];

export default function AdminDashboard() {
  const revenue = dailyRevenue.reduce((s, d) => s + d.revenueKobo, 0);
  const orderCount = dailyRevenue.reduce((s, d) => s + d.orders, 0);
  const live = orders.filter((o) => !["pending_payment", "refunded", "cancelled"].includes(o.stage));
  const cost = live.reduce((s, o) => s + o.costs.supplierKobo + o.costs.intlShippingKobo + o.costs.localDeliveryKobo + o.totals.gatewayFeeKobo, 0);
  const rev = live.reduce((s, o) => s + o.totals.paidKobo, 0);
  const margin = rev ? (rev - cost) / rev : 0;
  const balance = orders.reduce((s, o) => s + o.totals.balanceDueKobo, 0);

  const attention = [
    ...orders.filter((o) => o.stage === "awaiting_balance").map((o) => ({ href: `/admin/orders/${o.number}`, icon: Wallet, text: `${o.number} waiting on customer balance (${formatNaira(o.totals.balanceDueKobo)})` })),
    ...orders.filter((o) => o.stage === "paid" || o.stage === "sourcing").map((o) => ({ href: "/admin/sourcing", icon: ClipboardList, text: `${o.number} needs supplier purchase` })),
    ...orders.filter((o) => o.stage === "china_warehouse").map((o) => ({ href: "/admin/warehouse", icon: AlertTriangle, text: `${o.number} at China warehouse, needs weighing` })),
    ...tickets.filter((t) => t.status === "open").map((t) => ({ href: "/admin/support", icon: LifeBuoy, text: `Ticket: ${t.subject}` })),
  ];

  return (
    <>
      <PageHeader title="Overview" description={`Last 30 days · FX ₦${pricingSettings.fxRate} per ¥1`} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Revenue (30 days)" value={formatNaira(revenue)} sub="+12% vs previous 30 days" icon={Banknote} />
        <StatCard label="Orders (30 days)" value={orderCount.toLocaleString()} sub={`Avg ${formatNaira(revenue / orderCount)}`} icon={ShoppingCart} />
        <StatCard label="Gross margin" value={`${Math.round(margin * 100)}%`} sub="On active orders, after shipping and fees" icon={TrendingUp} />
        <StatCard label="Balances due" value={formatNaira(balance)} sub="Awaiting customer approval" icon={Wallet} tone={balance ? "warn" : "default"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Daily revenue</h2>
            <Link href="/admin/reports" className="text-sm font-medium text-brand-600 hover:underline">Reports</Link>
          </div>
          <RevenueChart data={dailyRevenue} />
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Needs attention <span className="text-gray-500">({attention.length})</span></h2>
          <ul className="grid gap-1">
            {attention.slice(0, 7).map((a) => (
              <li key={a.text}>
                <Link href={a.href} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-gray-50">
                  <a.icon className="size-4 shrink-0 text-orange-600" aria-hidden />
                  <span className="flex-1">{a.text}</span>
                  <ArrowRight className="size-4 text-gray-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h2 className="mb-4 font-semibold">Order pipeline</h2>
        <ol className="scrollbar-none flex gap-2 overflow-x-auto">
          {pipeline.map((s) => {
            const n = orders.filter((o) => o.stage === s).length;
            return (
              <li key={s} className="min-w-28 flex-1">
                <Link href={`/admin/orders?stage=${s}`} className={`block rounded-lg border p-3 hover:border-navy-900 ${n ? "border-gray-200" : "border-dashed border-gray-200 text-gray-400"}`}>
                  <p className="text-2xl font-semibold">{n}</p>
                  <p className="text-xs leading-tight">{stageMeta[s].label}</p>
                </Link>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand-600 hover:underline">All orders</Link>
        </div>
        <DataTable<Order>
          caption="Recent orders"
          rows={orders.slice(0, 6)}
          rowKey={(o) => o.id}
          columns={[
            { key: "n", header: "Order", cell: (o) => <Link href={`/admin/orders/${o.number}`} className="font-medium text-brand-600 hover:underline">{o.number}</Link> },
            { key: "c", header: "Customer", cell: (o) => o.customerName },
            { key: "s", header: "Stage", cell: (o) => <StageBadge stage={o.stage} /> },
            { key: "d", header: "Placed", cell: (o) => formatDateTime(o.createdAt) },
            { key: "t", header: "Total", align: "right", cell: (o) => formatNaira(o.totals.totalKobo) },
          ]}
        />
      </div>
    </>
  );
}
