import { carriers, regionOf, type Carrier, type RateBand } from "./data/settings";
import type { CarrierId, DeliveryMethod } from "./types";

/**
 * Delivery pricing for one store's shipment. Each store ships separately, so a
 * multi-store cart is the sum of its shipments, never one parcel from one place.
 */

export function carrierById(id: CarrierId): Carrier {
  return carriers.find((c) => c.id === id) ?? carriers[0]!;
}

export function bandFor(carrier: Carrier, originState: string, destState: string): RateBand {
  if (originState === destState) return carrier.rates.sameState;
  if (regionOf(originState) === regionOf(destState)) return carrier.rates.sameRegion;
  return carrier.rates.national;
}

const round = (kobo: number) => Math.ceil(kobo / 5_000) * 5_000;

export type ShipmentQuote = {
  priceKobo: number;
  days: [number, number];
  free: boolean;
  reason: string | null;
};

export function quoteShipment(args: {
  carrier: CarrierId;
  method: DeliveryMethod;
  originState: string;
  destState: string;
  /** Weight of items that are not "delivery included". */
  chargeableKg: number;
  /** All items in this shipment already include delivery in their price. */
  allFreeDelivery: boolean;
  storeSubtotalKobo: number;
  freeOverKobo: number | null;
}): ShipmentQuote {
  const c = carrierById(args.carrier);
  const band = bandFor(c, args.originState, args.destState);
  if (args.allFreeDelivery) return { priceKobo: 0, days: band.days, free: true, reason: "Delivery included in price" };
  if (args.freeOverKobo != null && args.storeSubtotalKobo >= args.freeOverKobo) {
    return { priceKobo: 0, days: band.days, free: true, reason: `Free delivery over ₦${(args.freeOverKobo / 100).toLocaleString()}` };
  }
  const kg = Math.max(1, Math.ceil(args.chargeableKg * 2) / 2);
  let price = band.baseKobo + (kg - 1) * band.perKgKobo;
  if (args.method === "pickup" && c.methods.includes("pickup")) price *= 1 - c.pickupDiscount;
  return { priceKobo: round(price), days: band.days, free: false, reason: null };
}
