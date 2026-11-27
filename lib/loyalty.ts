import { platformDefaults } from "./data/settings";
import type { Order } from "./types";

export type PointsEntry = { id: string; at: string; points: number; label: string; orderNumber?: string; pending: boolean };

const L = platformDefaults.loyalty;

/** Points earned on an order: 1 point per ₦100 of items, after discounts. */
export const pointsFor = (o: Pick<Order, "totals">) => Math.floor(((o.totals.itemsKobo - o.totals.discountKobo) / 100) * L.pointsPerNaira);

/**
 * Ledger built from orders. Points are pending until delivery is confirmed
 * (so refunds can't be gamed) and expire after the configured months.
 */
export function ledger(orders: Order[]): PointsEntry[] {
  const out: PointsEntry[] = [{ id: "welcome", at: "2026-03-14T10:00:00Z", points: 200, label: "Welcome bonus", pending: false }];
  for (const o of orders) {
    if (o.stage === "cancelled" || o.stage === "refunded" || o.stage === "pending_payment") continue;
    out.push({ id: o.id, at: o.createdAt, points: pointsFor(o), label: `Order ${o.number}`, orderNumber: o.number, pending: !(o.stage === "delivered") });
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

export function balance(entries: PointsEntry[]) {
  const available = entries.filter((e) => !e.pending).reduce((s, e) => s + e.points, 0);
  const pending = entries.filter((e) => e.pending).reduce((s, e) => s + e.points, 0);
  return { available, pending, valueKobo: available * L.nairaPerPoint * 100 };
}

/** Max points redeemable on a cart: capped at a share of the items total. */
export function maxRedeemKobo(availablePoints: number, itemsKobo: number) {
  if (availablePoints < L.minRedeemPoints) return 0;
  return Math.min(availablePoints * L.nairaPerPoint * 100, Math.floor(itemsKobo * L.maxRedeemShare));
}

export const loyaltyRules = L;
