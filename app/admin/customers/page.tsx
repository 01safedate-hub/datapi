import { DataTable, PageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/misc";
import { customers, orders } from "@/lib/data/ops";
import type { Customer } from "@/lib/types";
import { formatDate, formatNaira } from "@/lib/utils";

export const metadata = { title: "Customers" };

export default function CustomersPage() {
  const stats = (c: Customer) => {
    const mine = orders.filter((o) => o.customerId === c.id);
    return { count: mine.length, spent: mine.reduce((s, o) => s + o.totals.paidKobo, 0), due: mine.reduce((s, o) => s + o.totals.balanceDueKobo, 0) };
  };
  return (
    <>
      <PageHeader title="Customers" description={`${customers.length} registered · ${orders.filter((o) => !o.customerId).length} guest orders`} />
      <DataTable<Customer>
        caption="Customers"
        rows={customers}
        rowKey={(c) => c.id}
        columns={[
          { key: "n", header: "Customer", cell: (c) => <><span className="font-medium">{c.name}</span><span className="block text-xs text-gray-500">{c.email} · {c.phone}</span></> },
          { key: "l", header: "Location", cell: (c) => `${c.city}, ${c.state}` },
          { key: "j", header: "Joined", cell: (c) => formatDate(c.joinedAt) },
          { key: "o", header: "Orders", align: "right", cell: (c) => stats(c).count },
          { key: "s", header: "Spent", align: "right", cell: (c) => formatNaira(stats(c).spent) },
          { key: "b", header: "Balance", align: "right", cell: (c) => (stats(c).due ? <span className="font-medium text-orange-600">{formatNaira(stats(c).due)}</span> : "—") },
          { key: "m", header: "Marketing", cell: (c) => (c.marketingOptIn ? <Badge tone="good">Opted in</Badge> : <Badge>No</Badge>) },
        ]}
      />
    </>
  );
}
