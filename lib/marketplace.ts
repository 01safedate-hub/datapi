import "server-only";
import { products } from "./data/catalog";
import { DEMO_NOW, orders } from "./data/ops";
import { platformDefaults, subscriptionPlans } from "./data/settings";
import { storeById, stores } from "./data/stores";
import { variantPriceKobo } from "./pricing";
import type { Order, PayoutStatus, StoreOrder } from "./types";

/* ------------------------------------------------------------------ */
/* Payouts: Alaba Buyer Protection                                     */
/* ------------------------------------------------------------------ */

export type PayoutRow = {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  grossKobo: number;
  commissionKobo: number;
  netKobo: number;
  status: PayoutStatus;
  deliveredAt: string | null;
  confirmedAt: string | null;
  /** When the buyer's window closes and the payout becomes approvable without confirmation. */
  autoConfirmAt: string | null;
  buyerConfirmed: boolean;
};

const deliveredAt = (o: Order) => o.events.find((e) => e.stage === "delivered")?.at ?? null;

export function payoutRows(storeId?: string): PayoutRow[] {
  const out: PayoutRow[] = [];
  for (const o of orders) {
    for (const so of o.storeOrders) {
      if (so.payout === "not_applicable" || (storeId && so.storeId !== storeId)) continue;
      const d = deliveredAt(o);
      out.push({
        id: `${o.number}:${so.storeId}`,
        orderNumber: o.number,
        storeId: so.storeId,
        storeName: so.storeName,
        grossKobo: so.subtotalKobo,
        commissionKobo: so.commissionKobo,
        netKobo: so.subtotalKobo - so.commissionKobo,
        status: so.payout,
        deliveredAt: d,
        confirmedAt: o.deliveryConfirmedAt,
        autoConfirmAt: d ? new Date(Date.parse(d) + platformDefaults.buyerProtection.autoConfirmHours * 3_600_000).toISOString() : null,
        buyerConfirmed: !!o.deliveryConfirmedAt,
      });
    }
  }
  return out.sort((a, b) => order(a.status) - order(b.status) || (b.deliveredAt ?? "").localeCompare(a.deliveredAt ?? ""));
}

const order = (s: PayoutStatus) => ["awaiting_approval", "frozen", "held", "approved", "paid", "not_applicable"].indexOf(s);

export const payoutLabel: Record<PayoutStatus, { label: string; tone: "neutral" | "info" | "warn" | "good" | "bad" }> = {
  held: { label: "Held · awaiting delivery", tone: "neutral" },
  awaiting_approval: { label: "Ready to approve", tone: "warn" },
  approved: { label: "Approved", tone: "info" },
  paid: { label: "Paid out", tone: "good" },
  frozen: { label: "Frozen · dispute", tone: "bad" },
  not_applicable: { label: "Alaba stock", tone: "neutral" },
};

/* ------------------------------------------------------------------ */
/* Subscriptions & listing caps                                         */
/* ------------------------------------------------------------------ */

export function listingUsage(storeId: string) {
  const store = storeById(storeId);
  const plan = subscriptionPlans.find((p) => p.id === store.plan) ?? subscriptionPlans[0]!;
  const used = products.filter((p) => p.storeId === storeId && p.status !== "archived").length;
  return { plan, used, cap: plan.listingCap, remaining: plan.listingCap == null ? null : Math.max(0, plan.listingCap - used), atCap: plan.listingCap != null && used >= plan.listingCap };
}

/** Server guard used by "create listing" actions. */
export function canAddListing(storeId: string) {
  const u = listingUsage(storeId);
  return u.atCap ? { ok: false as const, message: `You've used all ${u.cap} listings on the ${u.plan.name} plan. Upgrade or archive a listing to add more.` } : { ok: true as const };
}

/* ------------------------------------------------------------------ */
/* Sponsored products (CPC / CPM / CPA)                                 */
/* ------------------------------------------------------------------ */

export type Campaign = {
  id: string;
  storeId: string;
  name: string;
  model: "cpc" | "cpm" | "cpa";
  /** CPC/CPM: bid in kobo. CPA: share of the sale (0–1). */
  bid: number;
  dailyBudgetKobo: number;
  productSlugs: string[];
  keywords: string[];
  status: "active" | "paused" | "pending_review";
  stats: { impressions: number; clicks: number; invalidClicks: number; conversions: number; spendKobo: number; salesKobo: number };
};

export const campaigns: Campaign[] = [
  { id: "cmp_01", storeId: "str_kora", name: "Power banks – search", model: "cpc", bid: 3_500, dailyBudgetKobo: 500_000, productSlugs: ["kora-20000mah-power-bank"], keywords: ["power bank", "nepa", "rechargeable"], status: "active", stats: { impressions: 18_420, clicks: 612, invalidClicks: 41, conversions: 38, spendKobo: 2_142_000, salesKobo: 52_400_000 } },
  { id: "cmp_02", storeId: "str_aba", name: "Loafers – pay per sale", model: "cpa", bid: 0.08, dailyBudgetKobo: 1_000_000, productSlugs: ["aba-handmade-leather-loafers"], keywords: ["loafers", "leather shoes", "aba"], status: "active", stats: { impressions: 9_310, clicks: 288, invalidClicks: 12, conversions: 21, spendKobo: 4_704_000, salesKobo: 58_800_000 } },
  { id: "cmp_03", storeId: "str_lekki", name: "Chargers – category", model: "cpm", bid: 60_000, dailyBudgetKobo: 300_000, productSlugs: ["nexa-65w-gan-charger"], keywords: ["charger", "gan", "fast charging"], status: "paused", stats: { impressions: 40_100, clicks: 402, invalidClicks: 66, conversions: 14, spendKobo: 2_406_000, salesKobo: 25_200_000 } },
];

/** Anti-fraud rules applied before a click or sale is billed. */
export const adFraudRules = [
  `One billable click per buyer per product every ${platformDefaults.ads.clickDedupeHours} hours`,
  "Clicks from the seller's own staff accounts and devices are never billed",
  "Bot, headless-browser and datacentre traffic is excluded",
  `CPA is charged only when the buyer confirms delivery, within ${platformDefaults.ads.cpa.attributionDays} days of the click`,
  "Refunded or cancelled orders reverse the CPA charge",
];

/** Ranking score for sponsored slots: bid × relevance × store quality. */
export function adScore(c: Campaign, relevance: number) {
  const store = storeById(c.storeId);
  const ctr = c.stats.impressions ? c.stats.clicks / c.stats.impressions : 0.01;
  const effectiveCpmKobo = c.model === "cpm" ? c.bid : c.model === "cpc" ? c.bid * ctr * 1000 : 0.02 * c.bid * 1_000_000;
  return effectiveCpmKobo * relevance * (store.metrics.rating / 5) * store.metrics.onTimeRate;
}

/**
 * Sponsored products for a results page. Returns nothing while the admin
 * switch is off, so the storefront stays organic until traffic justifies ads.
 */
export function sponsoredFor(query: string, enabled = platformDefaults.sponsoredAdsEnabled) {
  if (!enabled) return [];
  const q = query.toLowerCase();
  return campaigns
    .filter((c) => c.status === "active")
    .map((c) => ({ c, rel: c.keywords.some((k) => q.includes(k) || k.includes(q)) ? 1 : 0.2 }))
    .sort((a, b) => adScore(b.c, b.rel) - adScore(a.c, a.rel))
    .slice(0, 2)
    .flatMap(({ c }) => c.productSlugs);
}

/* ------------------------------------------------------------------ */
/* Inventory forecasting                                                */
/* ------------------------------------------------------------------ */

function rng(seed: number) {
  return () => {
    seed = (seed * 1_103_515_245 + 12_345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

export type ForecastRow = {
  productSlug: string;
  productName: string;
  storeName: string;
  sku: string;
  variant: string;
  stock: number;
  weekly: number[];
  forecastWeekly: number;
  daysOfCover: number;
  reorderPoint: number;
  suggestedQty: number;
  status: "reorder" | "watch" | "ok" | "overstock";
};

/**
 * Holt's linear smoothing on 8 weeks of sales per variant, with a safety
 * stock of z·σ·√lead-time. Demo history is seeded; production reads
 * `order_items` grouped by variant and week.
 */
export function forecast({ leadTimeDays = 7, serviceZ = 1.65 } = {}): ForecastRow[] {
  const rows: ForecastRow[] = [];
  for (const p of products) {
    if (p.source !== "local" || p.status !== "active") continue;
    const store = storeById(p.storeId);
    p.variants.forEach((v, i) => {
      const r = rng(p.id.length * 97 + i * 13 + p.sold);
      const base = Math.max(1, (p.sold / 40) / p.variants.length);
      const trend = (r() - 0.4) * 0.15;
      const weekly = Array.from({ length: 8 }, (_, w) => Math.max(0, Math.round(base * (1 + trend * w) * (0.7 + r() * 0.6))));
      let level = weekly[0]!;
      let slope = 0;
      const a = 0.5, b = 0.3;
      for (const y of weekly.slice(1)) {
        const prev = level;
        level = a * y + (1 - a) * (level + slope);
        slope = b * (level - prev) + (1 - b) * slope;
      }
      const f = Math.max(0, level + slope);
      const mean = weekly.reduce((s, x) => s + x, 0) / weekly.length;
      const sd = Math.sqrt(weekly.reduce((s, x) => s + (x - mean) ** 2, 0) / weekly.length);
      const daily = f / 7;
      const safety = serviceZ * (sd / Math.sqrt(7)) * Math.sqrt(leadTimeDays);
      const reorderPoint = Math.ceil(daily * leadTimeDays + safety);
      const daysOfCover = daily > 0 ? Math.floor(v.stock / daily) : 999;
      const target = Math.ceil(daily * (leadTimeDays + 28) + safety);
      rows.push({
        productSlug: p.slug,
        productName: p.name,
        storeName: store.name,
        sku: v.sku,
        variant: Object.values(v.options).join(" / ") || "Default",
        stock: v.stock,
        weekly,
        forecastWeekly: Math.round(f * 10) / 10,
        daysOfCover,
        reorderPoint,
        suggestedQty: Math.max(0, target - v.stock),
        status: v.stock <= reorderPoint ? "reorder" : daysOfCover < 21 ? "watch" : daysOfCover > 120 ? "overstock" : "ok",
      });
    });
  }
  return rows.sort((x, y) => ["reorder", "watch", "ok", "overstock"].indexOf(x.status) - ["reorder", "watch", "ok", "overstock"].indexOf(y.status) || x.daysOfCover - y.daysOfCover);
}

/* ------------------------------------------------------------------ */
/* Seller views                                                         */
/* ------------------------------------------------------------------ */

export function sellerOrders(storeId: string): { order: Order; so: StoreOrder }[] {
  return orders.flatMap((o) => o.storeOrders.filter((so) => so.storeId === storeId).map((so) => ({ order: o, so })));
}

export function sellerProducts(storeId: string) {
  return products
    .filter((p) => p.storeId === storeId)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0]!,
      status: p.status,
      variants: p.variants.length,
      stock: p.variants.reduce((s, v) => s + v.stock, 0),
      fromKobo: Math.min(...p.variants.map((v) => variantPriceKobo(p, v))),
      sold: p.sold,
      videoUrl: p.videoUrl,
      freeDelivery: p.freeDelivery,
    }));
}

/** The demo seller signed in at /seller. */
export const demoSellerStoreId = "str_aba";

export function sellerSummaries() {
  return stores.map((s) => ({ ...s, usage: listingUsage(s.id), payouts: payoutRows(s.id) }));
}

export const now = () => DEMO_NOW;
