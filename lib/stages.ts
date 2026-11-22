import type { OrderStage, ProductSource } from "./types";

export const stageMeta: Record<
  OrderStage,
  { label: string; customer: string; tone: "neutral" | "info" | "warn" | "good" | "bad" }
> = {
  pending_payment: { label: "Pending payment", customer: "Waiting for your payment", tone: "warn" },
  paid: { label: "Paid", customer: "Payment confirmed", tone: "info" },
  sourcing: { label: "Sourcing", customer: "We're ordering from the supplier", tone: "info" },
  purchased: { label: "Supplier purchased", customer: "Bought from the supplier", tone: "info" },
  china_warehouse: { label: "At China warehouse", customer: "Arrived at our China warehouse", tone: "info" },
  awaiting_balance: { label: "Awaiting balance", customer: "Action needed: shipping balance", tone: "warn" },
  dispatched: { label: "Dispatched", customer: "On a flight to Nigeria", tone: "info" },
  arrived_ng: { label: "Arrived Nigeria", customer: "Landed in Lagos", tone: "info" },
  customs_cleared: { label: "Customs cleared", customer: "Cleared customs", tone: "info" },
  ng_warehouse: { label: "Nigeria warehouse", customer: "At our Lagos warehouse", tone: "info" },
  out_for_delivery: { label: "Out for delivery", customer: "Out for delivery today", tone: "info" },
  ready_for_pickup: { label: "Ready for pickup", customer: "Ready for pickup", tone: "info" },
  delivered: { label: "Delivered", customer: "Delivered", tone: "good" },
  cancelled: { label: "Cancelled", customer: "Cancelled", tone: "bad" },
  refunded: { label: "Refunded", customer: "Refunded", tone: "bad" },
};

const importedFlow: OrderStage[] = [
  "paid", "sourcing", "purchased", "china_warehouse", "dispatched", "arrived_ng", "customs_cleared", "ng_warehouse",
];
const localFlow: OrderStage[] = ["paid", "ng_warehouse"];

/** The ordered list of stages an order goes through, used for the tracking timeline. */
export function flowFor(hasImported: boolean, fulfilment: "delivery" | "pickup"): OrderStage[] {
  const base = hasImported ? importedFlow : localFlow;
  return [...base, fulfilment === "pickup" ? "ready_for_pickup" : "out_for_delivery", "delivered"];
}

export function sourceFlow(source: ProductSource) {
  return source === "imported" ? importedFlow : localFlow;
}

/** Stages staff can move an order to next from the admin order page. */
export function nextStages(stage: OrderStage, hasImported: boolean, fulfilment: "delivery" | "pickup"): OrderStage[] {
  if (stage === "awaiting_balance") return ["dispatched"];
  const flow = flowFor(hasImported, fulfilment);
  const i = flow.indexOf(stage);
  if (i === -1 || i === flow.length - 1) return [];
  const next = flow[i + 1]!;
  return stage === "china_warehouse" ? [next, "awaiting_balance"] : [next];
}
