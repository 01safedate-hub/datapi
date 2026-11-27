import { carrierById } from "./delivery";
import type { Order, OrderStage, StoreOrder } from "./types";

export type Milestone = { key: string; title: string; detail: string; at?: string };
export type ShipmentTrack = {
  storeOrder: StoreOrder;
  imported: boolean;
  milestones: Milestone[];
  /** Index of the current milestone; milestones before it are done. */
  current: number;
  delivered: boolean;
  confirmed: boolean;
  problem: boolean;
};

const localRank: Partial<Record<OrderStage, number>> = {
  paid: 1, sourcing: 1, purchased: 2, china_warehouse: 2, awaiting_balance: 2,
  dispatched: 3, arrived_ng: 3, customs_cleared: 3, ng_warehouse: 3,
  out_for_delivery: 4, ready_for_pickup: 4, delivered: 5,
};
const importRank: Partial<Record<OrderStage, number>> = {
  paid: 1, sourcing: 1, purchased: 2, china_warehouse: 3, awaiting_balance: 3,
  dispatched: 4, arrived_ng: 5, customs_cleared: 5, ng_warehouse: 6,
  out_for_delivery: 7, ready_for_pickup: 7, delivered: 8,
};

/** Builds the buyer-facing milestone list for each seller's shipment. */
export function trackShipments(order: Order): ShipmentTrack[] {
  const at = (s: OrderStage) => order.events.find((e) => e.stage === s)?.at;
  const placed = order.events[0]?.at ?? order.createdAt;
  const pickup = order.fulfilment === "pickup";
  const confirmed = !!order.deliveryConfirmedAt;
  const problem = order.stage === "refunded" || order.stage === "cancelled";

  return order.storeOrders.map((so) => {
    const c = carrierById(so.carrier);
    const items = so.itemIndexes.map((i) => order.items[i]!);
    const imported = items.some((i) => i.source === "imported");
    const last: Milestone[] = [
      pickup
        ? { key: "ready", title: "Ready at pickup station", detail: `Bring your order number and phone to ${order.pickupPoint ?? "the station"}.`, at: at("ready_for_pickup") }
        : { key: "out", title: "Out for delivery", detail: `${c.name} rider is on the way. Keep your phone on.`, at: at("out_for_delivery") },
      { key: "delivered", title: "Delivered", detail: pickup ? "Collected from the pickup station." : "Handed to you at your address.", at: at("delivered") },
      {
        key: "confirmed",
        title: "Delivery confirmed",
        detail: confirmed ? "Thanks! The seller has been paid." : "Confirm you received everything so the seller can be paid. Report a problem instead if something's wrong.",
        at: order.deliveryConfirmedAt ?? undefined,
      },
    ];
    const milestones: Milestone[] = imported
      ? [
          { key: "placed", title: "Order placed & paid", detail: "Payment received by Alaba. Held under Buyer Protection.", at: at("paid") ?? placed },
          { key: "bought", title: "Bought from supplier", detail: "Alaba bought your item from our vetted supplier in China.", at: at("purchased") },
          { key: "cn", title: "Checked at China warehouse", detail: "Inspected, weighed and packed at our Guangzhou warehouse.", at: at("china_warehouse") },
          { key: "flight", title: "On a flight to Nigeria", detail: "Consolidated air shipment to Lagos.", at: at("dispatched") },
          { key: "customs", title: "Landed & cleared customs", detail: "Arrived in Lagos and cleared by our agent.", at: at("customs_cleared") ?? at("arrived_ng") },
          { key: "ng", title: "At Alaba warehouse, Lagos", detail: `Handed to ${c.name}${so.trackingNumber ? ` · ${so.trackingNumber}` : ""}.`, at: at("ng_warehouse") },
          ...last,
        ]
      : [
          { key: "placed", title: "Order placed & paid", detail: "Payment received by Alaba. Held under Buyer Protection.", at: at("paid") ?? placed },
          { key: "preparing", title: "Seller is preparing your order", detail: `${so.storeName} is packing your items.` },
          { key: "handed", title: `Handed to ${c.name}`, detail: so.trackingNumber ? `Tracking number ${so.trackingNumber}.` : "You'll get a tracking number when the courier collects it." },
          { key: "transit", title: "In transit", detail: `On the way from ${so.storeName}.` },
          ...last,
        ];
    const rank = (imported ? importRank : localRank)[order.stage] ?? 0;
    const delivered = order.stage === "delivered";
    const current = problem ? -1 : delivered ? (confirmed ? milestones.length : milestones.length - 1) : rank;
    return { storeOrder: so, imported, milestones, current, delivered, confirmed, problem };
  });
}

export function progressPct(t: ShipmentTrack) {
  if (t.current < 0) return 0;
  return Math.round((Math.min(t.current, t.milestones.length) / t.milestones.length) * 100);
}
