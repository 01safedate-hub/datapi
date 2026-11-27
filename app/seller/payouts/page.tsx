import { DataTable, PageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/misc";
import { demoSellerStoreId, payoutLabel, payoutRows } from "@/lib/marketplace";
import { formatDateTime, formatNaira } from "@/lib/utils";

export const metadata = { title: "Payouts" };

export default function SellerPayoutsPage() {
  const rows = payoutRows(demoSellerStoreId);
  return (
    <>
      <PageHeader title="Payouts" description="Alaba Buyer Protection: your money is held until the buyer confirms delivery, then approved by Alaba and sent to your bank." />
      <DataTable
        caption="Payouts"
        rows={rows}
        rowKey={(r) => r.id}
        empty="No payouts yet."
        columns={[
          { key: "o", header: "Order", cell: (r) => <span className="font-medium">{r.orderNumber}</span> },
          { key: "d", header: "Delivered", cell: (r) => (r.deliveredAt ? <span className="text-xs">{formatDateTime(r.deliveredAt)}<br />{r.buyerConfirmed ? "Confirmed by buyer" : `Auto-confirms ${formatDateTime(r.autoConfirmAt!)}`}</span> : "—") },
          { key: "g", header: "Sale", align: "right", cell: (r) => formatNaira(r.grossKobo) },
          { key: "c", header: "Commission", align: "right", cell: (r) => `−${formatNaira(r.commissionKobo)}` },
          { key: "n", header: "You receive", align: "right", cell: (r) => <strong>{formatNaira(r.netKobo)}</strong> },
          { key: "s", header: "Status", cell: (r) => <Badge tone={payoutLabel[r.status].tone}>{payoutLabel[r.status].label}</Badge> },
        ]}
      />
    </>
  );
}
