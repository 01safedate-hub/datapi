import Link from "next/link";
import { DataTable, PageHeader } from "@/components/admin/ui";
import { Badge } from "@/components/ui/misc";
import { shipments } from "@/lib/data/ops";
import type { Shipment } from "@/lib/types";
import { formatDate, formatKg, formatNaira } from "@/lib/utils";
import { NewShipment } from "./new-shipment";

export const metadata = { title: "Shipments" };

const stageLabel: Record<Shipment["stage"], [string, "neutral" | "info" | "good" | "warn"]> = {
  packing: ["Packing", "neutral"],
  dispatched: ["In the air", "info"],
  arrived_ng: ["Landed Lagos", "warn"],
  customs_cleared: ["Cleared", "info"],
  received: ["Received", "good"],
};

export default function ShipmentsPage() {
  return (
    <>
      <PageHeader title="Shipments" description="Consolidate weighed parcels into air shipments. Moving a shipment updates every order in it." actions={<NewShipment />} />
      <DataTable<Shipment>
        caption="Shipments"
        rows={shipments}
        rowKey={(s) => s.id}
        columns={[
          { key: "c", header: "Shipment", cell: (s) => <span className="font-medium">{s.code}</span> },
          { key: "a", header: "Agent / waybill", cell: (s) => <>{s.agent}<span className="block font-mono text-xs text-gray-500">{s.waybill}</span></> },
          { key: "o", header: "Orders", cell: (s) => s.orderNumbers.map((n, i) => <span key={n}>{i > 0 && ", "}<Link href={`/admin/orders/${n}`} className="text-brand-600 hover:underline">{n}</Link></span>) },
          { key: "k", header: "Chargeable", align: "right", cell: (s) => (s.chargeableKg ? formatKg(s.chargeableKg) : "—") },
          { key: "$", header: "Cost", align: "right", cell: (s) => (s.costKobo ? formatNaira(s.costKobo) : "—") },
          { key: "e", header: "ETA", cell: (s) => (s.etaAt ? formatDate(s.etaAt) : "—") },
          { key: "s", header: "Status", cell: (s) => <Badge tone={stageLabel[s.stage][1]}>{stageLabel[s.stage][0]}</Badge> },
        ]}
      />
    </>
  );
}
