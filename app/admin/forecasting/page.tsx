import { PageHeader, StatCard } from "@/components/admin/ui";
import { AlertTriangle, PackageCheck, TrendingUp } from "lucide-react";
import { Badge, Card } from "@/components/ui/misc";
import { forecast } from "@/lib/marketplace";

export const metadata = { title: "Stock forecasting" };

const tone = { reorder: "bad", watch: "warn", ok: "good", overstock: "neutral" } as const;

function Spark({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${18 - (v / max) * 16}`).join(" ");
  return <svg viewBox="0 0 60 20" className="h-5 w-16" aria-hidden><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-navy-900" /></svg>;
}

export default function ForecastPage() {
  const rows = forecast();
  const n = (s: string) => rows.filter((r) => r.status === s).length;
  return (
    <>
      <PageHeader title="Stock forecasting" description="Weekly demand per variant (Holt smoothing over 8 weeks), with a 95% service-level safety stock and 7-day restock lead time." />
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Reorder now" value={n("reorder")} icon={AlertTriangle} tone={n("reorder") ? "warn" : "default"} />
        <StatCard label="Watch (under 3 weeks)" value={n("watch")} icon={TrendingUp} />
        <StatCard label="Healthy" value={n("ok")} icon={PackageCheck} />
        <StatCard label="Overstock (4+ months)" value={n("overstock")} icon={PackageCheck} />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <caption className="sr-only">Forecast by variant</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs tracking-wide text-gray-600 uppercase">
            <tr><th className="px-4 py-3">Product / variant</th><th className="px-4 py-3">8 weeks</th><th className="px-4 py-3 text-right">Forecast /wk</th><th className="px-4 py-3 text-right">Stock</th><th className="px-4 py-3 text-right">Days cover</th><th className="px-4 py-3 text-right">Reorder at</th><th className="px-4 py-3 text-right">Suggest</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.slice(0, 60).map((r) => (
              <tr key={r.sku}>
                <td className="px-4 py-2.5"><p className="font-medium">{r.productName}</p><p className="text-xs text-gray-500">{r.variant} · {r.storeName} · {r.sku}</p></td>
                <td className="px-4 py-2.5"><Spark data={r.weekly} /></td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.forecastWeekly}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.stock}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.daysOfCover >= 999 ? "—" : r.daysOfCover}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.reorderPoint}</td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums">{r.suggestedQty || "—"}</td>
                <td className="px-4 py-2.5"><Badge tone={tone[r.status]} className="capitalize">{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
