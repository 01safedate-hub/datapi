"use server";

import { z } from "zod";
import { products } from "@/lib/data/catalog";
import { discounts } from "@/lib/data/ops";
import { carriers, nigerianStates, pickupPoints } from "@/lib/data/settings";
import { discountKobo, estShippingKobo, lineTotalKobo, quote, variantPriceKobo, type DeliveryChoice } from "@/lib/pricing";
import { balance, ledger, maxRedeemKobo } from "@/lib/loyalty";
import { getMyOrders } from "@/lib/orders";
import type { Discount } from "@/lib/types";

export type CouponResult = { ok: true; discount: Discount; message: string } | { ok: false; message: string };

export async function applyCoupon(rawCode: string, itemsKobo: number): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a discount code." };
  const d = discounts.find((x) => x.code === code);
  if (!d) return { ok: false, message: `“${code}” isn't a valid code. Check for typos.` };
  if (!d.active || (d.usageLimit != null && d.used >= d.usageLimit)) return { ok: false, message: `“${code}” has ended.` };
  if (d.expiresAt && Date.parse(d.expiresAt) < Date.now()) return { ok: false, message: `“${code}” expired on ${d.expiresAt}.` };
  if (itemsKobo < d.minSpendKobo) {
    return { ok: false, message: `Add ₦${((d.minSpendKobo - itemsKobo) / 100).toLocaleString()} more to use “${code}”.` };
  }
  const saving = discountKobo(d, itemsKobo);
  return { ok: true, discount: d, message: `“${code}” applied. You save ₦${(saving / 100).toLocaleString()}.` };
}

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+?234|0)[789][01]\d{8}$/.test(v), "Enter a valid Nigerian phone number, e.g. 0803 123 4567");

const orderSchema = z
  .object({
    email: z.email("Enter a valid email address so we can send your receipt"),
    phone,
    name: z.string().trim().min(2, "Enter your full name"),
    method: z.enum(["door", "pickup"]),
    carrier: z.enum(["gig", "jumia"]),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().optional(),
    pickupId: z.string().optional(),
    provider: z.literal("paystack"),
    whatsapp: z.boolean(),
    usePoints: z.boolean().optional(),
    coupon: z.string().nullable(),
    lines: z
      .array(z.object({ productId: z.string(), variantId: z.string(), quantity: z.number().int().min(1).max(999) }))
      .min(1, "Your cart is empty"),
  })
  .superRefine((v, ctx) => {
    const c = carriers.find((x) => x.id === v.carrier && x.active);
    if (!c) ctx.addIssue({ code: "custom", path: ["carrier"], message: "Choose a courier" });
    else if (!c.methods.includes(v.method)) ctx.addIssue({ code: "custom", path: ["method"], message: `${c.name} doesn't offer pickup stations` });
    if (v.method === "door") {
      if (!v.address || v.address.length < 5) ctx.addIssue({ code: "custom", path: ["address"], message: "Enter your street address" });
      if (!v.city) ctx.addIssue({ code: "custom", path: ["city"], message: "Enter your city or area" });
      if (!v.state || !nigerianStates.includes(v.state)) ctx.addIssue({ code: "custom", path: ["state"], message: "Choose your state" });
    } else if (!pickupPoints.some((p) => p.id === v.pickupId)) {
      ctx.addIssue({ code: "custom", path: ["pickupId"], message: "Choose a pickup station" });
    }
  });

export type OrderInput = z.input<typeof orderSchema>;
export type PlaceOrderResult =
  | { ok: true; orderNumber: string; totalKobo: number }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/**
 * Validates the order and recomputes every price on the server — the browser's
 * numbers are never trusted. In production this inserts the order, then
 * initialises Paystack and returns the gateway's checkout URL.
 */
export async function placeOrder(input: OrderInput): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }
  const v = parsed.data;

  const lines = [];
  for (const l of v.lines) {
    const p = products.find((x) => x.id === l.productId && x.status === "active");
    if (!p) return { ok: false, message: "An item in your cart is no longer available. Please review your cart." };
    if (p.availability === "out_of_stock") return { ok: false, message: `${p.name} just sold out. Remove it to continue.` };
    if (l.quantity < p.moq) return { ok: false, message: `${p.name} has a minimum order of ${p.moq}.` };
    const variant = p.variants.find((x) => x.id === l.variantId);
    if (!variant) return { ok: false, message: `The option you chose for ${p.name} is no longer available. Please re-add it.` };
    if (p.source === "local" && variant.stock < l.quantity) {
      return { ok: false, message: variant.stock ? `Only ${variant.stock} of ${p.name} left. Reduce the quantity to continue.` : `${p.name} (${Object.values(variant.options).join(", ")}) just sold out.` };
    }
    lines.push({
      source: p.source,
      storeId: p.storeId,
      unitPriceKobo: variantPriceKobo(p, variant),
      wholesale: p.wholesale,
      unitShippingKobo: estShippingKobo(p),
      estWeightKg: p.estWeightKg,
      quantity: l.quantity,
      freeDelivery: p.freeDelivery,
    });
  }

  const state = v.method === "pickup" ? pickupPoints.find((x) => x.id === v.pickupId)!.state : v.state!;
  const delivery: DeliveryChoice = { state, carrier: v.carrier, method: v.method };
  let discount: Discount | null = null;
  if (v.coupon) {
    const itemsKobo = lines.reduce((s, l) => s + lineTotalKobo(l), 0);
    const res = await applyCoupon(v.coupon, itemsKobo);
    if (res.ok) discount = res.discount;
  }
  // Production: reserve stock per variant (15-minute hold) and create one
  // store_order per seller from q.stores, each with payout status "held".
  // Points balance comes from the signed-in buyer's ledger, never from the client.
  const pts = v.usePoints ? maxRedeemKobo(balance(ledger(getMyOrders())).available, lines.reduce((s, l) => s + lineTotalKobo(l), 0)) : 0;
  const q = quote(lines, delivery, discount, pts);

  // Demo: simulate the gateway round-trip.
  await new Promise((r) => setTimeout(r, 900));
  const orderNumber = `ALB-${10507 + Math.floor(Math.random() * 400)}`;
  return { ok: true, orderNumber, totalKobo: q.totalKobo };
}
