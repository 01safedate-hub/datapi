import { DataTable, PageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/misc";
import { suppliers } from "@/lib/data/ops";
import type { Supplier } from "@/lib/types";
import { formatRmb } from "@/lib/utils";

export const metadata = { title: "Suppliers" };

const pct = (n: number) => `${(n * 100).toFixed(n < 0.1 ? 1 : 0)}%`;

export default function SuppliersPage() {
  return (
    <>
      <PageHeader title="Suppliers" description="Performance is calculated from every purchase recorded in the sourcing queue." />
      <DataTable<Supplier>
        caption="Suppliers"
        rows={[...suppliers].sort((a, b) => b.spendFen - a.spendFen)}
        rowKey={(s) => s.id}
        columns={[
          { key: "n", header: "Supplier", cell: (s) => <><span className="font-medium">{s.name}</span><span className="block text-xs text-gray-500">{s.city} · {s.platform}</span></> },
          { key: "c", header: "Contact", cell: (s) => <span className="text-gray-700">{s.contact}</span> },
          { key: "o", header: "Orders", align: "right", cell: (s) => s.ordersCount },
          { key: "s", header: "Total spend", align: "right", cell: (s) => formatRmb(s.spendFen) },
          { key: "t", header: "On time", align: "right", cell: (s) => <Badge tone={s.onTimeRate >= 0.95 ? "good" : s.onTimeRate >= 0.88 ? "warn" : "bad"}>{pct(s.onTimeRate)}</Badge> },
          { key: "d", header: "Defects", align: "right", cell: (s) => <Badge tone={s.defectRate <= 0.01 ? "good" : s.defectRate <= 0.03 ? "warn" : "bad"}>{pct(s.defectRate)}</Badge> },
        ]}
      />
    </>
  );
}
