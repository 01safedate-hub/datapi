import { defaultAgent, pricingSettings, type ShippingAgent } from "./data/settings";
import { storeById } from "./data/stores";
import { quoteShipment } from "./delivery";
import type { CarrierId, DeliveryMethod, Discount, PaymentProvider, Product, ProductSource, Variant, WholesaleTier } from "./types";

/**
 * Alaba pricing engine. Pure functions so the same maths runs on the server
 * (authoritative) and in the browser (instant feedback). All money in kobo.
 */

const roundUp = (kobo: number, step = pricingSettings.roundToKobo) => Math.ceil(kobo / step) * step;

export function markupFor(category: string) {
  return pricingSettings.categoryMarkup[category] ?? pricingSettings.defaultMarkup;
}

type PriceSource = Pick<Product, "source" | "supplierPriceFen" | "priceKobo" | "category">;

/** Customer-facing price of one variant, in kobo. */
export function variantPriceKobo(product: Pick<Product, "source" | "category">, variant: Pick<Variant, "supplierPriceFen" | "priceKobo">) {
  if (product.source === "local") return variant.priceKobo ?? 0;
  // fen → yuan (÷100) → naira (× fx) → kobo (×100): the 100s cancel.
  const costKobo = (variant.supplierPriceFen ?? 0) * pricingSettings.fxRate;
  return roundUp(costKobo * (1 + markupFor(product.category)));
}

/** Lowest customer-facing price of a product ("from ₦X"), in kobo. */
export function unitPriceKobo(product: PriceSource & { variants?: Variant[] }) {
  if (product.variants?.length) return Math.min(...product.variants.map((v) => variantPriceKobo(product, v)));
  return variantPriceKobo(product, product);
}

/** Wholesale: the deepest tier the quantity qualifies for. */
export function wholesaleUnitKobo(unitKobo: number, tiers: WholesaleTier[], quantity: number) {
  const tier = [...tiers].sort((a, b) => b.minQty - a.minQty).find((t) => quantity >= t.minQty);
  return tier ? roundUp(unitKobo * (1 - tier.discount), 5_000) : unitKobo;
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

export function gatewayFeeKobo(amountKobo: number, provider: PaymentProvider) {
  const g = pricingSettings.gateway[provider];
  const flat = amountKobo < g.waiveFlatBelowKobo ? 0 : g.flatKobo;
  return Math.min(g.capKobo, Math.round(amountKobo * g.pct + flat));
}

export type QuoteLine = {
  source: ProductSource;
  storeId: string;
  unitPriceKobo: number;
  wholesale: WholesaleTier[];
  unitShippingKobo: number;
  estWeightKg: number;
  quantity: number;
  freeDelivery: boolean;
};

export type DeliveryChoice = { state: string; carrier: CarrierId; method: DeliveryMethod };

export type StoreQuote = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  itemsKobo: number;
  weightKg: number;
  deliveryKobo: number;
  free: boolean;
  reason: string | null;
  days: [number, number] | null;
};

export type Quote = {
  itemsKobo: number;
  intlShippingKobo: number;
  localDeliveryKobo: number;
  serviceFeeKobo: number;
  discountKobo: number;
  loyaltyKobo: number;
  vatKobo: number;
  totalKobo: number;
  totalWeightKg: number;
  hasImported: boolean;
  stores: StoreQuote[];
};

export function discountKobo(discount: Discount | null, itemsKobo: number) {
  if (!discount || !discount.active || itemsKobo < discount.minSpendKobo) return 0;
  const raw = discount.type === "percent" ? Math.round(itemsKobo * (discount.value / 100)) : discount.value;
  return Math.min(raw, itemsKobo);
}

/** Line total after wholesale tiers. */
export const lineTotalKobo = (l: Pick<QuoteLine, "unitPriceKobo" | "wholesale" | "quantity">) =>
  wholesaleUnitKobo(l.unitPriceKobo, l.wholesale, l.quantity) * l.quantity;

/**
 * Price a cart. Items are grouped by store; each store ships separately with
 * the buyer's chosen carrier, and the delivery total is the sum of shipments.
 */
export function quote(
  lines: QuoteLine[],
  delivery: DeliveryChoice | null,
  discount: Discount | null = null,
  loyaltyKobo = 0,
): Quote {
  const itemsKobo = lines.reduce((s, l) => s + lineTotalKobo(l), 0);
  const intlShippingKobo = lines.reduce((s, l) => s + l.unitShippingKobo * l.quantity, 0);
  const totalWeightKg = lines.reduce((s, l) => s + l.estWeightKg * l.quantity, 0);

  const byStore = new Map<string, QuoteLine[]>();
  for (const l of lines) byStore.set(l.storeId, [...(byStore.get(l.storeId) ?? []), l]);
  const stores: StoreQuote[] = [...byStore.entries()].map(([storeId, ls]) => {
    const store = storeById(storeId);
    const subtotal = ls.reduce((s, l) => s + lineTotalKobo(l), 0);
    const chargeable = ls.filter((l) => !l.freeDelivery);
    const weight = chargeable.reduce((s, l) => s + l.estWeightKg * l.quantity, 0);
    const q = delivery
      ? quoteShipment({
          carrier: delivery.carrier,
          method: delivery.method,
          originState: store.state,
          destState: delivery.state,
          chargeableKg: weight,
          allFreeDelivery: chargeable.length === 0,
          storeSubtotalKobo: subtotal,
          freeOverKobo: store.freeDeliveryOverKobo,
        })
      : null;
    return {
      storeId,
      storeName: store.name,
      storeSlug: store.slug,
      itemsKobo: subtotal,
      weightKg: weight,
      deliveryKobo: q?.priceKobo ?? 0,
      free: q?.free ?? chargeable.length === 0,
      reason: q?.reason ?? (chargeable.length === 0 ? "Delivery included in price" : null),
      days: q?.days ?? null,
    };
  });

  const local = stores.reduce((s, x) => s + x.deliveryKobo, 0);
  const serviceFeeKobo = lines.length ? pricingSettings.serviceFeeKobo : 0;
  const disc = discountKobo(discount, itemsKobo);
  const loyalty = Math.min(loyaltyKobo, Math.max(0, itemsKobo - disc));
  const taxable = itemsKobo - disc - loyalty + serviceFeeKobo;
  const vatKobo = pricingSettings.vat.enabled ? Math.round(taxable * pricingSettings.vat.rate) : 0;
  return {
    itemsKobo,
    intlShippingKobo,
    localDeliveryKobo: local,
    serviceFeeKobo,
    discountKobo: disc,
    loyaltyKobo: loyalty,
    vatKobo,
    totalKobo: itemsKobo + intlShippingKobo + local + serviceFeeKobo + vatKobo - disc - loyalty,
    totalWeightKg,
    hasImported: lines.some((l) => l.source === "imported"),
    stores,
  };
}
