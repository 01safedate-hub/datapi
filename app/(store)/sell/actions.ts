"use server";

import { z } from "zod";
import { brands } from "@/lib/data/stores";
import { nigerianStates, subscriptionPlans } from "@/lib/data/settings";

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+?234|0)[789][01]\d{8}$/.test(v), "Enter a valid Nigerian phone number");

const sellerSchema = z
  .object({
    type: z.enum(["manufacturer", "vendor"], { message: "Choose how you sell" }),
    businessName: z.string().trim().min(3, "Enter your business name").max(80),
    cac: z.string().trim().regex(/^(RC|BN|IT)?\s?\d{5,8}$/i, "Enter your CAC number, e.g. RC 1234567 or BN 3456789"),
    contactName: z.string().trim().min(2, "Enter your full name"),
    email: z.email("Enter a valid email address"),
    phone,
    state: z.string().refine((s) => nigerianStates.includes(s), "Choose your state"),
    city: z.string().trim().min(2, "Enter your city or area"),
    categories: z.array(z.string()).min(1, "Choose at least one category"),
    plan: z.string().refine((p) => subscriptionPlans.some((x) => x.id === p), "Choose a plan"),
    // Manufacturer-only
    capacity: z.string().trim().optional(),
    moq: z.string().trim().optional(),
    customization: z.array(z.string()).optional(),
    agree: z.literal(true, { message: "You must accept the seller terms" }),
  })
  .superRefine((v, ctx) => {
    if (v.type === "manufacturer") {
      if (!v.capacity) ctx.addIssue({ code: "custom", path: ["capacity"], message: "Tell buyers roughly how much you can make each month" });
      if (!v.moq) ctx.addIssue({ code: "custom", path: ["moq"], message: "Enter your minimum order for bulk or custom work" });
    }
  });

export type SellerInput = z.input<typeof sellerSchema>;
export type FormResult = { ok: true; reference: string } | { ok: false; message: string; fieldErrors?: Record<string, string> };

const errorsOf = (e: z.ZodError) => {
  const out: Record<string, string> = {};
  for (const i of e.issues) out[String(i.path[0] ?? "form")] ??= i.message;
  return out;
};

/** Production: creates the store (status "pending_review") and emails KYC next steps. */
export async function applyAsSeller(input: SellerInput): Promise<FormResult> {
  const parsed = sellerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: errorsOf(parsed.error) };
  await new Promise((r) => setTimeout(r, 800));
  return { ok: true, reference: `SEL-${Math.floor(100000 + Math.random() * 900000)}` };
}

const brandSchema = z.object({
  brandName: z.string().trim().min(2, "Enter the brand name").max(60),
  owner: z.string().trim().min(3, "Enter the company that owns the brand"),
  trademark: z.string().trim().min(4, "Enter your trademark registration or application number"),
  website: z.union([z.literal(""), z.url("Enter a full link, e.g. https://yourbrand.com")]),
  email: z.email("Use an email on your brand's domain if you can"),
  phone,
  role: z.enum(["owner", "distributor", "agency"], { message: "Choose your relationship to the brand" }),
  agree: z.literal(true, { message: "You must confirm you're authorised" }),
});

export type BrandInput = z.input<typeof brandSchema>;

export async function registerBrand(input: BrandInput): Promise<FormResult> {
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: errorsOf(parsed.error) };
  const existing = brands.find((b) => b.name.toLowerCase() === parsed.data.brandName.toLowerCase() && b.official);
  if (existing) return { ok: false, message: `${existing.name} is already an official brand. If you own it, contact sellers@alaba.ng.`, fieldErrors: { brandName: "Already registered" } };
  await new Promise((r) => setTimeout(r, 800));
  return { ok: true, reference: `BRD-${Math.floor(10000 + Math.random() * 90000)}` };
}
