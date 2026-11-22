/**
 * Pricing rules. In production these rows live in Supabase (`fx_rates`,
 * `markup_rules`, `shipping_rates`, `delivery_zones`) and are edited from
 * /admin/pricing. Values here are demo figures.
 */
export const pricingSettings = {
  /** Naira per 1 RMB. */
  fxRate: 215,
  fxUpdatedAt: "2026-11-21T09:00:00.000Z",
  defaultMarkup: 0.2,
  categoryMarkup: {
    phones: 0.15,
    computers: 0.15,
    fashion: 0.3,
    beauty: 0.3,
  } as Record<string, number>,
  /** Round customer prices up to the nearest ₦50. */
  roundToKobo: 5_000,
  /** Order-level service fee in kobo. */
  serviceFeeKobo: 0,
  vat: { enabled: false, rate: 0.075 },
  gateway: {
    paystack: { pct: 0.015, flatKobo: 10_000, capKobo: 200_000, waiveFlatBelowKobo: 250_000 },
    flutterwave: { pct: 0.014, flatKobo: 0, capKobo: 200_000, waiveFlatBelowKobo: 0 },
  },
};

export type ShippingAgent = {
  id: string;
  name: string;
  mode: "air" | "sea";
  ratePerKgKobo: number;
  clearancePerKgKobo: number;
  volumetricDivisor: number;
  minChargeableKg: number;
  transitDays: [number, number];
  active: boolean;
};

export const shippingAgents: ShippingAgent[] = [
  {
    id: "agent-air-1",
    name: "Guangzhou–Lagos Air Express",
    mode: "air",
    ratePerKgKobo: 1_100_000,
    clearancePerKgKobo: 150_000,
    volumetricDivisor: 6000,
    minChargeableKg: 0.5,
    transitDays: [7, 12],
    active: true,
  },
  {
    id: "agent-air-2",
    name: "Yiwu Cargo Air",
    mode: "air",
    ratePerKgKobo: 1_050_000,
    clearancePerKgKobo: 180_000,
    volumetricDivisor: 6000,
    minChargeableKg: 1,
    transitDays: [9, 14],
    active: false,
  },
];

export const defaultAgent = shippingAgents[0]!;

export type DeliveryZone = {
  id: string;
  name: string;
  states: string[];
  baseKobo: number;
  perKgKobo: number;
  days: [number, number];
};

export const deliveryZones: DeliveryZone[] = [
  { id: "lagos", name: "Lagos", states: ["Lagos"], baseKobo: 150_000, perKgKobo: 300_000, days: [1, 2] },
  {
    id: "south-west",
    name: "South-West",
    states: ["Ogun", "Oyo", "Osun", "Ondo", "Ekiti"],
    baseKobo: 250_000,
    perKgKobo: 300_000,
    days: [2, 4],
  },
  { id: "fct", name: "Abuja (FCT)", states: ["FCT"], baseKobo: 300_000, perKgKobo: 300_000, days: [2, 4] },
  { id: "rest", name: "Other states", states: [], baseKobo: 400_000, perKgKobo: 300_000, days: [3, 6] },
];

export const pickupPoints = [
  { id: "ikeja", name: "Ikeja Hub", address: "12 Allen Avenue, Ikeja, Lagos", feeKobo: 0 },
  { id: "lekki", name: "Lekki Hub", address: "Admiralty Way, Lekki Phase 1, Lagos", feeKobo: 0 },
  { id: "wuse", name: "Wuse Hub", address: "Aminu Kano Crescent, Wuse 2, Abuja", feeKobo: 50_000 },
];

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
  "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export function zoneForState(state: string): DeliveryZone {
  return deliveryZones.find((z) => z.states.includes(state)) ?? deliveryZones[deliveryZones.length - 1]!;
}
