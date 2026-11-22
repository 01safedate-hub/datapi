import { PageHeader } from "@/components/admin/ui";
import { orders } from "@/lib/data/ops";
import { DeliveryBoard, type DeliveryCard } from "./delivery-board";

export const metadata = { title: "Deliveries" };

export default function DeliveriesPage() {
  const cards: DeliveryCard[] = orders
    .filter((o) => ["ng_warehouse", "out_for_delivery", "ready_for_pickup", "customs_cleared", "arrived_ng"].includes(o.stage))
    .map((o) => ({
      number: o.number,
      stage: o.stage,
      customer: o.customerName,
      phone: o.phone,
      where: o.fulfilment === "pickup" ? `Pickup: ${o.pickupPoint}` : `${o.address.city}, ${o.address.state}`,
      pickup: o.fulfilment === "pickup",
      items: o.items.reduce((s, i) => s + i.quantity, 0),
    }));
  return (
    <>
      <PageHeader title="Deliveries" description="From Lagos warehouse to the customer. Assign a courier, or mark ready for pickup." />
      <DeliveryBoard cards={cards} />
    </>
  );
}
