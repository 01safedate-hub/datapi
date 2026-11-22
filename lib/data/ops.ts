import { gatewayFeeKobo, localDeliveryKobo, unitPriceKobo, estShippingKobo, chargeableKg } from "../pricing";
import { flowFor } from "../stages";
import type {
  AuditEntry,
  Customer,
  Discount,
  Order,
  OrderEvent,
  OrderStage,
  PaymentProvider,
  Shipment,
  Staff,
  Supplier,
  Ticket,
} from "../types";
import { products } from "./catalog";
import { pickupPoints, pricingSettings } from "./settings";

/** Fixed "now" so demo data is stable between builds. */
export const DEMO_NOW = "2026-11-22T08:00:00.000Z";
const hoursAgo = (h: number) => new Date(Date.parse(DEMO_NOW) - h * 3_600_000).toISOString();

export const customers: Customer[] = [
  { id: "cus_01", name: "Adaeze Okafor", email: "adaeze@example.com", phone: "+234 803 111 2201", city: "Lekki", state: "Lagos", joinedAt: "2026-03-14", marketingOptIn: true },
  { id: "cus_02", name: "Tunde Adeyemi", email: "tunde.a@example.com", phone: "+234 802 222 3302", city: "Ibadan", state: "Oyo", joinedAt: "2026-05-02", marketingOptIn: false },
  { id: "cus_03", name: "Chiamaka Nwosu", email: "chiamaka@example.com", phone: "+234 806 333 4403", city: "Enugu", state: "Enugu", joinedAt: "2026-06-21", marketingOptIn: true },
  { id: "cus_04", name: "Ibrahim Musa", email: "ibrahim.m@example.com", phone: "+234 809 444 5504", city: "Wuse", state: "FCT", joinedAt: "2026-07-09", marketingOptIn: true },
  { id: "cus_05", name: "Funmilayo Kuti", email: "funmi@example.com", phone: "+234 701 555 6605", city: "Ikeja", state: "Lagos", joinedAt: "2026-08-17", marketingOptIn: false },
  { id: "cus_06", name: "Emeka Udeh", email: "emeka.u@example.com", phone: "+234 813 666 7706", city: "Port Harcourt", state: "Rivers", joinedAt: "2026-09-03", marketingOptIn: true },
  { id: "cus_07", name: "Zainab Yusuf", email: "zainab@example.com", phone: "+234 816 777 8807", city: "Kano", state: "Kano", joinedAt: "2026-10-11", marketingOptIn: true },
  { id: "cus_08", name: "Segun Bakare", email: "segun.b@example.com", phone: "+234 805 888 9908", city: "Abeokuta", state: "Ogun", joinedAt: "2026-11-02", marketingOptIn: false },
];

/** The signed-in customer used by the demo account area. */
export const demoCustomer = customers[0]!;

type Spec = {
  number: string;
  customer: number | null;
  guest?: { name: string; email: string; phone: string; state: string; city: string };
  items: [slug: string, qty: number, options?: Record<string, string>][];
  stage: OrderStage;
  hoursAgo: number;
  provider: PaymentProvider;
  pickup?: string;
  balanceKobo?: number;
  assignedTo?: string;
  notes?: string[];
};

const specs: Spec[] = [
  { number: "SHZ-10482", customer: 0, items: [["volt-x12-5g-smartphone", 1, { Colour: "Ocean Blue" }], ["nexa-65w-gan-charger", 1]], stage: "dispatched", hoursAgo: 260, provider: "paystack", assignedTo: "Kemi (Orders)" },
  { number: "SHZ-10479", customer: 0, items: [["kora-20000mah-power-bank", 2, { Colour: "Black" }]], stage: "delivered", hoursAgo: 410, provider: "flutterwave" },
  { number: "SHZ-10491", customer: 0, items: [["vista-27-4k-monitor", 1]], stage: "awaiting_balance", hoursAgo: 190, provider: "paystack", balanceKobo: 1_875_000, notes: ["Measured 9.2 kg chargeable vs 8 kg estimated."] },
  { number: "SHZ-10495", customer: 1, items: [["aero-14-ultrabook", 1], ["glide-silent-mouse", 1, { Colour: "Grey" }]], stage: "purchased", hoursAgo: 70, provider: "paystack", assignedTo: "Kemi (Orders)" },
  { number: "SHZ-10497", customer: 2, items: [["stride-running-sneakers", 2, { "Size (EU)": "42", Colour: "White/Navy" }]], stage: "sourcing", hoursAgo: 30, provider: "flutterwave" },
  { number: "SHZ-10499", customer: 3, items: [["breeze-rechargeable-fan", 1]], stage: "out_for_delivery", hoursAgo: 40, provider: "paystack" },
  { number: "SHZ-10500", customer: 4, items: [["nova-air-fryer-6l", 1], ["aqua-insulated-bottle", 2, { Colour: "Navy" }]], stage: "china_warehouse", hoursAgo: 150, provider: "paystack", assignedTo: "Bayo (Warehouse)" },
  { number: "SHZ-10501", customer: 5, items: [["echo-bass-bluetooth-speaker", 1, { Colour: "Blue" }]], stage: "ready_for_pickup", hoursAgo: 28, provider: "flutterwave", pickup: "lekki" },
  { number: "SHZ-10502", customer: null, guest: { name: "Ngozi Eze", email: "ngozi.eze@example.com", phone: "+234 708 101 2020", state: "Anambra", city: "Awka" }, items: [["luxe-tote-bag", 1, { Colour: "Tan" }]], stage: "paid", hoursAgo: 3, provider: "paystack" },
  { number: "SHZ-10503", customer: 6, items: [["pixel-watch-fit-pro", 1, { Strap: "Navy silicone" }], ["pulse-buds-anc", 1, { Colour: "Black" }]], stage: "customs_cleared", hoursAgo: 300, provider: "paystack" },
  { number: "SHZ-10504", customer: 7, items: [["core-adjustable-dumbbells", 1]], stage: "ng_warehouse", hoursAgo: 20, provider: "flutterwave" },
  { number: "SHZ-10505", customer: 1, items: [["mesh-wifi-router-ax3000", 1]], stage: "pending_payment", hoursAgo: 1, provider: "paystack" },
  { number: "SHZ-10470", customer: 3, items: [["beam-smart-projector", 1]], stage: "refunded", hoursAgo: 620, provider: "paystack", notes: ["Supplier out of stock. Customer chose refund."] },
  { number: "SHZ-10506", customer: 2, items: [["gleam-hair-dryer", 1], ["edge-beard-trimmer", 1]], stage: "arrived_ng", hoursAgo: 240, provider: "flutterwave" },
];

const staffNames: Partial<Record<OrderStage, string>> = {
  paid: "System",
  sourcing: "System",
  purchased: "Kemi (Orders)",
  china_warehouse: "Li Wei (China WH)",
  awaiting_balance: "Li Wei (China WH)",
  dispatched: "Bayo (Logistics)",
  arrived_ng: "Bayo (Logistics)",
  customs_cleared: "Bayo (Logistics)",
  ng_warehouse: "Bayo (Logistics)",
  out_for_delivery: "Dispatch rider",
  ready_for_pickup: "Lekki Hub",
  delivered: "Dispatch rider",
};

function build(spec: Spec, index: number): Order {
  const c = spec.customer != null ? customers[spec.customer]! : null;
  const contact = c ?? { name: spec.guest!.name, email: spec.guest!.email, phone: spec.guest!.phone, state: spec.guest!.state, city: spec.guest!.city };
  const items = spec.items.map(([slug, quantity, options]) => {
    const p = products.find((x) => x.slug === slug)!;
    return {
      productId: p.id,
      name: p.name,
      image: p.images[0]!,
      source: p.source,
      options: options ?? {},
      quantity,
      unitPriceKobo: unitPriceKobo(p),
      estWeightKg: p.estWeightKg,
      supplierCostFen: p.supplierPriceFen,
      shipKobo: estShippingKobo(p),
      chargeKg: p.source === "imported" ? chargeableKg(p.estWeightKg, p.dimsCm) : 0,
    };
  });
  const hasImported = items.some((i) => i.source === "imported");
  const fulfilment = spec.pickup ? "pickup" : "delivery";
  const itemsKobo = items.reduce((s, i) => s + i.unitPriceKobo * i.quantity, 0);
  const intl = items.reduce((s, i) => s + i.shipKobo * i.quantity, 0);
  const weight = items.reduce((s, i) => s + i.estWeightKg * i.quantity, 0);
  const local = localDeliveryKobo(weight, spec.pickup ? { method: "pickup", pickupId: spec.pickup } : { method: "delivery", state: contact.state });
  const total = itemsKobo + intl + local;
  const paid = spec.stage === "pending_payment" ? 0 : total;
  const balance = spec.balanceKobo ?? 0;

  const flow = flowFor(hasImported, fulfilment);
  const terminal = ["refunded", "cancelled", "pending_payment", "awaiting_balance"].includes(spec.stage);
  let reached: OrderStage[] = [];
  if (spec.stage === "awaiting_balance") reached = [...flow.slice(0, flow.indexOf("china_warehouse") + 1), "awaiting_balance"];
  else if (spec.stage === "refunded") reached = ["paid", "sourcing", "refunded"];
  else if (!terminal) reached = flow.slice(0, flow.indexOf(spec.stage) + 1);
  const step = reached.length > 1 ? spec.hoursAgo / reached.length : 0;
  const events: OrderEvent[] = reached.map((stage, i) => ({
    stage,
    at: hoursAgo(spec.hoursAgo - step * i),
    by: staffNames[stage] ?? "Admin",
    note: stage === "awaiting_balance" ? spec.notes?.[0] : undefined,
  }));

  const supplierKobo = items.reduce((s, i) => s + (i.supplierCostFen ?? 0) * pricingSettings.fxRate * i.quantity, 0)
    + items.filter((i) => i.source === "local").reduce((s, i) => s + Math.round(i.unitPriceKobo * 0.72) * i.quantity, 0);

  return {
    id: `ord_${String(index + 1).padStart(3, "0")}`,
    number: spec.number,
    customerId: c?.id ?? null,
    customerName: contact.name,
    email: contact.email,
    phone: contact.phone,
    address: { line1: `${12 + index} Adeola Odeku Street`, city: contact.city, state: contact.state },
    fulfilment,
    pickupPoint: spec.pickup ? pickupPoints.find((p) => p.id === spec.pickup)?.name : undefined,
    items: items.map(({ shipKobo: _s, chargeKg: _c, ...rest }) => rest),
    stage: spec.stage,
    events,
    provider: spec.provider,
    totals: {
      itemsKobo,
      intlShippingKobo: intl,
      clearanceKobo: 0,
      localDeliveryKobo: local,
      discountKobo: 0,
      vatKobo: 0,
      totalKobo: total + balance,
      paidKobo: paid,
      balanceDueKobo: balance,
      gatewayFeeKobo: paid ? gatewayFeeKobo(paid, spec.provider) : 0,
    },
    costs: {
      supplierKobo,
      intlShippingKobo: Math.round(intl * 0.82),
      localDeliveryKobo: Math.round(local * 0.7),
    },
    fxRate: pricingSettings.fxRate,
    trackingNumbers: ["dispatched", "arrived_ng", "customs_cleared", "ng_warehouse", "out_for_delivery", "delivered"].includes(spec.stage) && hasImported
      ? [`GZLOS-${spec.number.slice(4)}-A`]
      : [],
    assignedTo: spec.assignedTo,
    notes: spec.notes ?? [],
    createdAt: hoursAgo(spec.hoursAgo),
  };
}

export const orders: Order[] = specs.map(build).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const staff: Staff[] = [
  { id: "stf_01", name: "Owner (you)", email: "owner@shupzy.com", role: "super_admin", lastActiveAt: hoursAgo(0.2) },
  { id: "stf_02", name: "Kemi Adebayo", email: "kemi@shupzy.com", role: "order_manager", lastActiveAt: hoursAgo(1) },
  { id: "stf_03", name: "Daniel Obi", email: "daniel@shupzy.com", role: "product_manager", lastActiveAt: hoursAgo(5) },
  { id: "stf_04", name: "Li Wei", email: "liwei@shupzy.com", role: "warehouse", lastActiveAt: hoursAgo(9) },
  { id: "stf_05", name: "Bayo Salami", email: "bayo@shupzy.com", role: "warehouse", lastActiveAt: hoursAgo(2) },
  { id: "stf_06", name: "Grace Effiong", email: "grace@shupzy.com", role: "support", lastActiveAt: hoursAgo(0.5) },
  { id: "stf_07", name: "Musa Bello", email: "musa@shupzy.com", role: "finance", lastActiveAt: hoursAgo(26) },
];

export const roleLabels: Record<Staff["role"], string> = {
  super_admin: "Super Admin",
  order_manager: "Order Manager",
  product_manager: "Product Manager",
  warehouse: "Warehouse Staff",
  support: "Customer Support",
  finance: "Finance Manager",
};

export const suppliers: Supplier[] = [
  { id: "sup_01", name: "Shenzhen Voltek Electronics", city: "Shenzhen", contact: "WeChat: voltek_sales", platform: "1688", onTimeRate: 0.96, defectRate: 0.01, ordersCount: 142, spendFen: 38_420_000 },
  { id: "sup_02", name: "Guangzhou Urban Apparel", city: "Guangzhou", contact: "+86 138 0000 1122", platform: "Alibaba", onTimeRate: 0.91, defectRate: 0.03, ordersCount: 88, spendFen: 9_310_000 },
  { id: "sup_03", name: "Yiwu HomePlus Trading", city: "Yiwu", contact: "homeplus@example.cn", platform: "Alibaba", onTimeRate: 0.88, defectRate: 0.02, ordersCount: 64, spendFen: 12_870_000 },
  { id: "sup_04", name: "Dongguan Keyflow Peripherals", city: "Dongguan", contact: "WeChat: keyflow_dg", platform: "1688", onTimeRate: 0.98, defectRate: 0.005, ordersCount: 51, spendFen: 7_640_000 },
  { id: "sup_05", name: "Ningbo Gleam Appliances", city: "Ningbo", contact: "+86 139 0000 3344", platform: "Alibaba", onTimeRate: 0.84, defectRate: 0.04, ordersCount: 23, spendFen: 2_980_000 },
];

export const shipments: Shipment[] = [
  { id: "shp_01", code: "AIR-2611-03", agent: "Guangzhou–Lagos Air Express", waybill: "176-48213390", orderNumbers: ["SHZ-10482", "SHZ-10503"], chargeableKg: 38.5, costKobo: 42_350_000, stage: "dispatched", dispatchedAt: hoursAgo(60), etaAt: hoursAgo(-90) },
  { id: "shp_02", code: "AIR-2611-02", agent: "Guangzhou–Lagos Air Express", waybill: "176-48201175", orderNumbers: ["SHZ-10506"], chargeableKg: 52, costKobo: 57_200_000, stage: "arrived_ng", dispatchedAt: hoursAgo(200), etaAt: hoursAgo(20) },
  { id: "shp_03", code: "AIR-2611-04", agent: "Guangzhou–Lagos Air Express", waybill: "—", orderNumbers: ["SHZ-10500"], chargeableKg: 0, costKobo: 0, stage: "packing" },
];

export const discounts: Discount[] = [
  { code: "WELCOME10", type: "percent", value: 10, minSpendKobo: 2_000_000, firstOrderOnly: true, usageLimit: null, used: 412, expiresAt: null, active: true },
  { code: "NAIJA5K", type: "fixed", value: 500_000, minSpendKobo: 10_000_000, firstOrderOnly: false, usageLimit: 500, used: 133, expiresAt: "2026-12-31", active: true },
  { code: "BLACKFRIDAY", type: "percent", value: 15, minSpendKobo: 5_000_000, firstOrderOnly: false, usageLimit: 1000, used: 0, expiresAt: "2026-11-30", active: true },
  { code: "SUMMER25", type: "percent", value: 25, minSpendKobo: 0, firstOrderOnly: false, usageLimit: 200, used: 200, expiresAt: "2026-08-31", active: false },
];

export const tickets: Ticket[] = [
  { id: "tkt_01", orderNumber: "SHZ-10491", customerName: "Adaeze Okafor", subject: "Why is there a shipping balance?", status: "open", updatedAt: hoursAgo(2), lastMessage: "Hi, I got a message to pay extra shipping. Can you explain?" },
  { id: "tkt_02", orderNumber: "SHZ-10497", customerName: "Chiamaka Nwosu", subject: "Change shoe size to 43", status: "pending", updatedAt: hoursAgo(6), lastMessage: "We've asked the supplier, will confirm shortly." },
  { id: "tkt_03", orderNumber: null, customerName: "Ibrahim Musa", subject: "Do you deliver to Kaduna?", status: "resolved", updatedAt: hoursAgo(30), lastMessage: "Yes, 3–6 working days after arrival in Lagos." },
];

export const auditLog: AuditEntry[] = [
  { id: "aud_01", actor: "Li Wei", action: "Recorded weight 9.2 kg (est. 8 kg)", target: "Order SHZ-10491", at: hoursAgo(3) },
  { id: "aud_02", actor: "Owner", action: "Changed FX rate ₦212 → ₦215", target: "Pricing", at: hoursAgo(23) },
  { id: "aud_03", actor: "Kemi Adebayo", action: "Moved to Supplier purchased", target: "Order SHZ-10495", at: hoursAgo(30) },
  { id: "aud_04", actor: "Daniel Obi", action: "Published product", target: "Glow LED Skincare Mask", at: hoursAgo(50) },
  { id: "aud_05", actor: "Musa Bello", action: "Approved refund ₦210,450", target: "Order SHZ-10470", at: hoursAgo(120) },
  { id: "aud_06", actor: "Owner", action: "Invited staff member", target: "Grace Effiong (Support)", at: hoursAgo(300) },
];

/** 30 days of demo revenue for the dashboard chart, in kobo. */
export const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(Date.parse(DEMO_NOW) - (29 - i) * 86_400_000);
  const base = 180_000_000 + Math.sin(i / 3) * 40_000_000 + i * 4_000_000 + (d.getUTCDay() === 6 ? 60_000_000 : 0);
  return { date: d.toISOString().slice(0, 10), revenueKobo: Math.round(base), orders: Math.round(base / 9_000_000) };
});
