import { RevenueChart } from "@/components/admin/revenue-chart";
import { DataTable, PageHeader, StatCard } from "@/components/admin/ui";
import { Card } from "@/components/ui/misc";
import { categories, products } from "@/lib/data/catalog";
import { dailyRevenue, orders } from "@/lib/data/ops";
import { unitPriceKobo } from "@/lib/pricing";
import { formatNaira } from "@/lib/utils";
import { ExportButton } from "./export-button";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  const live = orders.filter((o) => o.totals.paidKobo > 0 && o.stage !== "refunded");
  const sum = (f: (o: (typeof live)[number]) => number) => live.reduce((s, o) => s + f(o), 0);
  const revenue = sum((o) => o.totals.paidKobo);
  const supplier = sum((o) => o.costs.supplierKobo);
  const freight = sum((o) => o.costs.intlShippingKobo);
  const courier = sum((o) => o.costs.localDeliveryKobo);
  const fees = sum((o) => o.totals.gatewayFeeKobo);
  const refunds = orders.filter((o) => o.stage === "refunded").reduce((s, o) => s + o.totals.paidKobo, 0);
  const gross = revenue - supplier - freight - courier;
  const net = gross - fees;

  const best = [...products].sort((a, b) => b.sold - a.sold).slice(0, 8);
  const byCat = categories.map((c) => {
    const ps = products.filter((p) => p.category === c.slug);
    return { name: c.name, units: ps.reduce((s, p) => s + p.sold, 0), revenue: ps.reduce((s, p) => s + p.sold * unitPriceKobo(p), 0) };
  }).sort((a, b) => b.revenue - a.revenue);

  const pl = [
    { line: "Revenue (paid)", ngn: revenue },
    { line: "Supplier purchases", ngn: -supplier },
    { line: "International shipping", ngn: -freight },
    { line: "Local delivery", ngn: -courier },
    { line: "Gross profit", ngn: gross },
    { line: "Gateway fees", ngn: -fees },
    { line: "Net profit", ngn: net },
  ];

  return (
    <>
      <PageHeader title="Reports" description="Profit uses frozen per-order costs, so changing today's rates never rewrites history." actions={<ExportButton rows={pl.map((r) => ({ line: r.line, amount_ngn: r.ngn / 100 }))} />} />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatNaira(revenue)} />
        <StatCard label="Gross profit" value={formatNaira(gross)} sub={`${Math.round((gross / revenue) * 100)}% margin`} />
        <StatCard label="Net profit" value={formatNaira(net)} sub={`After ${formatNaira(fees)} gateway fees`} />
        <StatCard label="Refunds" value={formatNaira(refunds)} />
      </div>

      <Card className="mt-6 p-5"><h2 className="mb-4 font-semibold">Daily revenue, 30 days</h2><RevenueChart data={dailyRevenue} /></Card>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="min-w-0">
          <h2 className="mb-3 font-semibold">Profit and loss (active orders)</h2>
          <DataTable caption="Profit and loss" rows={pl} rowKey={(r) => r.line} columns={[
            { key: "l", header: "Line", cell: (r) => <span className={r.line.includes("profit") ? "font-semibold" : ""}>{r.line}</span> },
            { key: "v", header: "Amount", align: "right", cell: (r) => <span className={r.line.includes("profit") ? "font-semibold" : r.ngn < 0 ? "text-gray-600" : ""}>{r.ngn < 0 ? `−${formatNaira(-r.ngn)}` : formatNaira(r.ngn)}</span> },
          ]} />
        </div>
        <div className="min-w-0">
          <h2 className="mb-3 font-semibold">Sales by category</h2>
          <DataTable caption="Sales by category" rows={byCat} rowKey={(r) => r.name} columns={[
            { key: "n", header: "Category", cell: (r) => r.name },
            { key: "u", header: "Units", align: "right", cell: (r) => r.units.toLocaleString() },
            { key: "r", header: "Revenue", align: "right", cell: (r) => formatNaira(r.revenue) },
          ]} />
        </div>
      </div>

      <div className="mt-6 min-w-0">
        <h2 className="mb-3 font-semibold">Best sellers</h2>
        <DataTable caption="Best sellers" rows={best} rowKey={(p) => p.id} columns={[
          { key: "n", header: "Product", cell: (p) => p.name },
          { key: "s", header: "Source", cell: (p) => (p.source === "imported" ? "Imported" : "Local") },
          { key: "u", header: "Units sold", align: "right", cell: (p) => p.sold.toLocaleString() },
          { key: "r", header: "Revenue", align: "right", cell: (p) => formatNaira(p.sold * unitPriceKobo(p)) },
        ]} />
      </div>
    </>
  );
}
