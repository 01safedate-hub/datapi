import type { Brand, Store } from "../types";

/**
 * Demo stores. Alaba Verified is store 1 (Alaba's own); the others show how
 * manufacturers and vendors appear once outside sellers are onboarded.
 */
export const stores: Store[] = [
  {
    id: "str_alaba",
    slug: "alaba-verified",
    name: "Alaba Verified",
    type: "vendor",
    isPlatform: true,
    verified: true,
    tagline: "Sold and shipped by Alaba",
    description:
      "Alaba's own store. Every product is checked by our team before it ships, including items we import directly from manufacturers in China.",
    city: "Ojo",
    state: "Lagos",
    joinedAt: "2026-01-10",
    plan: "pro",
    freeDeliveryOverKobo: 10_000_000,
    metrics: { responseHours: 0.5, fulfilmentRate: 0.99, cancellationRate: 0.004, onTimeRate: 0.96, avgDispatchDays: 1, rating: 4.7, reviewCount: 2140, ordersCompleted: 8900 },
  },
  {
    id: "str_kora",
    slug: "kora-power-industries",
    name: "Kora Power Industries",
    type: "manufacturer",
    isPlatform: false,
    verified: true,
    tagline: "Power banks and solar kits, made in Lagos",
    description: "Assembles power banks, inverter batteries and solar lighting in Ikeja. Supplies retailers nationwide and accepts custom branding.",
    city: "Ikeja",
    state: "Lagos",
    joinedAt: "2026-03-02",
    plan: "pro",
    freeDeliveryOverKobo: null,
    metrics: { responseHours: 2.1, fulfilmentRate: 0.97, cancellationRate: 0.012, onTimeRate: 0.93, avgDispatchDays: 2, rating: 4.6, reviewCount: 389, ordersCompleted: 1250 },
    manufacturing: {
      moq: "50 units for custom branding",
      capacity: "8,000 units a month",
      leadTime: "10–14 days for custom orders",
      customization: ["Logo printing", "Custom colours", "Private-label packaging"],
      certifications: ["SON MANCAP", "CAC registered"],
    },
  },
  {
    id: "str_aba",
    slug: "aba-leatherworks",
    name: "Aba Leatherworks",
    type: "manufacturer",
    isPlatform: false,
    verified: true,
    tagline: "Handmade leather shoes and bags from Aba",
    description: "A family workshop of 40 artisans making leather shoes, backpacks and belts. Wholesale and custom orders welcome.",
    city: "Aba",
    state: "Abia",
    joinedAt: "2026-04-18",
    plan: "free",
    freeDeliveryOverKobo: null,
    metrics: { responseHours: 4.5, fulfilmentRate: 0.95, cancellationRate: 0.02, onTimeRate: 0.88, avgDispatchDays: 3, rating: 4.5, reviewCount: 211, ordersCompleted: 640 },
    manufacturing: {
      moq: "12 pairs per design",
      capacity: "1,500 pairs a month",
      leadTime: "7–10 days",
      customization: ["Custom sizes", "Embossed logos", "Choice of leather"],
      certifications: ["CAC registered"],
    },
  },
  {
    id: "str_lekki",
    slug: "lekki-gadget-hub",
    name: "Lekki Gadget Hub",
    type: "vendor",
    isPlatform: false,
    verified: true,
    tagline: "Phones, audio and accessories",
    description: "Retail gadget store in Lekki Phase 1 selling genuine accessories with warranty.",
    city: "Lekki",
    state: "Lagos",
    joinedAt: "2026-06-09",
    plan: "free",
    freeDeliveryOverKobo: 5_000_000,
    metrics: { responseHours: 1.2, fulfilmentRate: 0.96, cancellationRate: 0.018, onTimeRate: 0.91, avgDispatchDays: 1, rating: 4.4, reviewCount: 520, ordersCompleted: 1900 },
  },
  {
    id: "str_kano",
    slug: "arewa-home-appliances",
    name: "Arewa Home Appliances",
    type: "vendor",
    isPlatform: false,
    verified: false,
    tagline: "Fans, blenders and kitchen essentials",
    description: "Appliance distributor in Kano. New seller on Alaba.",
    city: "Kano",
    state: "Kano",
    joinedAt: "2026-11-05",
    plan: "free",
    freeDeliveryOverKobo: null,
    metrics: { responseHours: 6, fulfilmentRate: 0.9, cancellationRate: 0.03, onTimeRate: 0.85, avgDispatchDays: 2, rating: 4.2, reviewCount: 18, ordersCompleted: 41 },
  },
];

export const platformStore = stores[0]!;

export function storeById(id: string) {
  return stores.find((s) => s.id === id) ?? platformStore;
}

export function storeBySlug(slug: string) {
  return stores.find((s) => s.slug === slug) ?? null;
}

const brandRows: [name: string, official: boolean, country: string, description: string][] = [
  ["Volt", true, "China", "Mid-range Android smartphones."],
  ["Nexa", true, "China", "GaN chargers and cables."],
  ["Kora", true, "Nigeria", "Power banks and solar lighting, assembled in Lagos."],
  ["Pulse", false, "China", "Wireless audio."],
  ["Shield", false, "China", "Phone cases and screen protection."],
  ["Aero", true, "China", "Thin-and-light laptops."],
  ["Keyflow", false, "China", "Mechanical keyboards."],
  ["Glide", false, "China", "Computer mice."],
  ["Vista", false, "China", "Monitors."],
  ["Stash", false, "China", "Portable storage."],
  ["Beam", false, "China", "Smart projectors."],
  ["Echo", false, "China", "Portable speakers."],
  ["Snap", false, "China", "Action cameras."],
  ["Fitly", false, "China", "Smartwatches."],
  ["Linkr", false, "China", "Routers and networking."],
  ["Breeze", true, "Nigeria", "Rechargeable fans."],
  ["Nova", false, "China", "Kitchen appliances."],
  ["Pure", false, "China", "Blenders and grinders."],
  ["Lumi", false, "China", "Lighting."],
  ["Aqua", false, "China", "Drinkware."],
  ["Cloud", false, "China", "Cushions and comfort."],
  ["Urban Thread", false, "China", "Menswear."],
  ["Stride", false, "China", "Running shoes."],
  ["Metro", false, "Nigeria", "Bags and backpacks."],
  ["Luxe", false, "China", "Handbags."],
  ["Polar", false, "China", "Eyewear."],
  ["Gleam", false, "China", "Hair care appliances."],
  ["Edge", false, "China", "Grooming."],
  ["Aura", false, "Nigeria", "Perfume oils."],
  ["Glow", false, "China", "Skincare devices."],
  ["Joy", false, "China", "Kids' ride-ons and toys."],
  ["Core", false, "China", "Fitness equipment."],
  ["Playr", false, "China", "Gaming accessories."],
  ["Aba Leatherworks", true, "Nigeria", "Handmade leather goods from Aba."],
];

export const brands: Brand[] = brandRows.map(([name, official, country, description]) => ({
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  name,
  official,
  country,
  description,
}));

export function brandBySlug(slug: string) {
  return brands.find((b) => b.slug === slug) ?? null;
}
