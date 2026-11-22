import {
  defaultAgent,
  pickupPoints,
  pricingSettings,
  zoneForState,
  type ShippingAgent,
} from "./data/settings";
import type { Discount, PaymentProvider, Product, ProductSource } from "./types";

/**
 * Shupzy pricing engine. Pure functions so the same maths runs on the server
 * (authoritative) and in the browser (instant feedback). All money in kobo.
 */

const roundUp = (kobo: number, step = pricingSettings.roundToKobo) => Math.ceil(kobo / step) * step;

export function markupFor(category: string) {
  return pricingSettings.categoryMarkup[category] ?? pricingSettings.defaultMarkup;
}

/** Customer-facing unit price in kobo. */
export function unitPriceKobo(product: Pick<Product, "source" | "supplierPriceFen" | "priceKobo" | "category">) {
  if (product.source === "local") return product.priceKobo ?? 0;
  const fen = product.supplierPriceFen ?? 0;
  // fen → yuan (÷100) → naira (× fx) → kobo (×100): the 100s cancel.
  const costKobo = fen * pricingSettings.fxRate;
  return roundUp(costKobo * (1 + markupFor(product.category)));
}

export function volumetricKg(dimsCm: [number, number, number], divisor: number) {
  const [l, w, h] = dimsCm;
  return (l * w * h) / divisor;
}

/** Chargeable weight: the greater of actual and volumetric, rounded up to 0.5 kg. */
export function chargeableKg(actualKg: number, dimsCm: [number, number, number], agent: ShippingAgent = defaultAgent) {
  const kg = Math.max(actualKg, volumetricKg(dimsCm, agent.volumetricDivisor));
  return Math.max(agent.minChargeableKg, Math.ceil(kg * 2) / 2);
}

/** Estimated China → Lagos air freight + clearance for one unit. */
export function estShippingKobo(
  product: Pick<Product, "source" | "estWeightKg" | "dimsCm">,
  agent: ShippingAgent = defaultAgent,
) {
  if (product.source === "local") return 0;
  const kg = chargeableKg(product.estWeightKg, product.dimsCm, agent);
  return roundUp(kg * (agent.ratePerKgKobo + agent.clearancePerKgKobo));
}

export type Fulfilment = { method: "delivery"; state: string } | { method: "pickup"; pickupId: string };

export function localDeliveryKobo(totalKg: number, fulfilment: Fulfilment) {
  if (fulfilment.method === "pickup") {
    return pickupPoints.find((p) => p.id === fulfilment.pickupId)?.feeKobo ?? 0;
  }
  const zone = zoneForState(fulfilment.state);
  return roundUp(zone.baseKobo + Math.max(0, totalKg - 1) * zone.perKgKobo);
}

export function gatewayFeeKobo(amountKobo: number, provider: PaymentProvider) {
  const g = pricingSettings.gateway[provider];
  const flat = amountKobo < g.waiveFlatBelowKobo ? 0 : g.flatKobo;
  return Math.min(g.capKobo, Math.round(amountKobo * g.pct + flat));
}

export type QuoteLine = {
  source: ProductSource;
  unitPriceKobo: number;
  unitShippingKobo: number;
  estWeightKg: number;
  quantity: number;
};

export type Quote = {
  itemsKobo: number;
  intlShippingKobo: number;
  localDeliveryKobo: number;
  serviceFeeKobo: number;
  discountKobo: number;
  vatKobo: number;
  totalKobo: number;
  totalWeightKg: number;
  hasImported: boolean;
};

export function discountKobo(discount: Discount | null, itemsKobo: number) {
  if (!discount || !discount.active || itemsKobo < discount.minSpendKobo) return 0;
  const raw = discount.type === "percent" ? Math.round(itemsKobo * (discount.value / 100)) : discount.value;
  return Math.min(raw, itemsKobo);
}

export function quote(lines: QuoteLine[], fulfilment: Fulfilment | null, discount: Discount | null = null): Quote {
  const itemsKobo = lines.reduce((s, l) => s + l.unitPriceKobo * l.quantity, 0);
  const intlShippingKobo = lines.reduce((s, l) => s + l.unitShippingKobo * l.quantity, 0);
  const totalWeightKg = lines.reduce((s, l) => s + l.estWeightKg * l.quantity, 0);
  const local = fulfilment && lines.length ? localDeliveryKobo(totalWeightKg, fulfilment) : 0;
  const serviceFeeKobo = lines.length ? pricingSettings.serviceFeeKobo : 0;
  const disc = discountKobo(discount, itemsKobo);
  const taxable = itemsKobo - disc + serviceFeeKobo;
  const vatKobo = pricingSettings.vat.enabled ? Math.round(taxable * pricingSettings.vat.rate) : 0;
  return {
    itemsKobo,
    intlShippingKobo,
    localDeliveryKobo: local,
    serviceFeeKobo,
    discountKobo: disc,
    vatKobo,
    totalKobo: itemsKobo + intlShippingKobo + local + serviceFeeKobo + vatKobo - disc,
    totalWeightKg,
    hasImported: lines.some((l) => l.source === "imported"),
  };
}
