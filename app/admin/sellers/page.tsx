import { BadgeCheck } from "lucide-react";
import Link from "next/link";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/misc";
import { sellerSummaries } from "@/lib/marketplace";

export const metadata = { title: "Sellers" };

export default function SellersPage() {
  const rows = sellerSummaries();
  return (
    <>
      <PageHeader title="Sellers" description="Manufacturers and vendors on Alaba. Metrics are computed from orders, never entered by sellers." />
      <DataTable
        caption="Sellers"
        rows={rows}
        rowKey={(r) => r.id}
        columns={[
          { key: "n", header: "Store", cell: (r) => <span className="grid"><Link href={`/store/${r.slug}`} target="_blank" className="flex items-center gap-1 font-medium hover:underline">{r.name}{r.verified && <BadgeCheck className="size-4 text-brand-600" aria-label="Verified" />}</Link><span className="text-xs text-gray-500">{r.city}, {r.state}</span></span> },
          { key: "t", header: "Type", cell: (r) => (r.isPlatform ? <Badge tone="navy">Alaba</Badge> : r.type === "manufacturer" ? <Badge tone="orange">Manufacturer</Badge> : <Badge tone="info">Vendor</Badge>) },
          { key: "p", header: "Plan", cell: (r) => <span>{r.usage.plan.name}<span className="block text-xs text-gray-500">{r.usage.used}/{r.usage.cap ?? "∞"} listings</span></span> },
          { key: "r", header: "Rating", align: "right", cell: (r) => r.metrics.rating.toFixed(1) },
          { key: "o", header: "On time", align: "right", cell: (r) => `${Math.round(r.metrics.onTimeRate * 100)}%` },
          { key: "c", header: "Cancel rate", align: "right", cell: (r) => <span className={r.metrics.cancellationRate > 0.02 ? "font-medium text-red-600" : undefined}>{(r.metrics.cancellationRate * 100).toFixed(1)}%</span> },
          { key: "s", header: "Status", cell: (r) => (r.verified ? <Badge tone="good">Active</Badge> : <Badge tone="warn">Pending KYC</Badge>) },
        ]}
      />
    </>
  );
}
