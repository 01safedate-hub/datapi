"use server";

import { z } from "zod";
import { categories } from "@/lib/data/catalog";
import { brands } from "@/lib/data/stores";
import { canAddListing, demoSellerStoreId } from "@/lib/marketplace";
import { parseVideoLink, videoLinkHelp } from "@/lib/video";

const variantSchema = z.object({
  label: z.string().trim().max(60),
  priceNaira: z.number({ message: "Enter a price" }).min(100, "Price must be at least ₦100").max(50_000_000),
  stock: z.number().int().min(0, "Stock can't be negative").max(1_000_000),
});

const listingSchema = z.object({
  name: z.string().trim().min(8, "Use a clear name of at least 8 characters").max(120),
  brand: z.string().min(1, "Choose a brand. Every product needs one."),
  category: z.string().refine((c) => categories.some((x) => x.slug === c), "Choose a category"),
  description: z.string().trim().min(30, "Describe the product in at least 30 characters").max(4000),
  optionName: z.string().trim().max(30),
  variants: z.array(variantSchema).min(1).max(100),
  specs: z.array(z.object({ key: z.string().trim().max(40), value: z.string().trim().max(120) })).max(30),
  wholesale: z.array(z.object({ minQty: z.number().int().min(2), discountPct: z.number().min(1).max(60) })).max(5),
  moq: z.number().int().min(1).max(10_000),
  weightKg: z.number().positive("Enter the packed weight").max(500),
  freeDelivery: z.boolean(),
  videoUrl: z.string().trim().max(200),
  condition: z.enum(["new", "refurbished", "used"]),
  warranty: z.string().trim().max(80),
});

export type ListingInput = z.input<typeof listingSchema>;

/**
 * Creates a listing for the signed-in seller's store. Sellers can only create
 * local listings; imported products are Alaba-only.
 */
export async function createListing(input: ListingInput): Promise<{ ok: true; slug: string } | { ok: false; message: string; fieldErrors?: Record<string, string> }> {
  const cap = canAddListing(demoSellerStoreId);
  if (!cap.ok) return { ok: false, message: cap.message };

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join(".")] ??= i.message;
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }
  const v = parsed.data;
  if (!brands.some((b) => b.slug === v.brand) && v.brand !== "unbranded") return { ok: false, message: "Choose a brand from the list or request a new one.", fieldErrors: { brand: "Unknown brand" } };
  if (v.videoUrl && !parseVideoLink(v.videoUrl)) return { ok: false, message: "That video link isn't allowed.", fieldErrors: { videoUrl: videoLinkHelp } };
  if (v.variants.length > 1 && !v.optionName) return { ok: false, message: "Name the option your variants differ by.", fieldErrors: { optionName: "e.g. Size, Colour" } };
  const labels = v.variants.map((x) => x.label.toLowerCase());
  if (v.variants.length > 1 && (labels.some((l) => !l) || new Set(labels).size !== labels.length)) return { ok: false, message: "Each variant needs a different name.", fieldErrors: { variants: "Give each variant a unique name" } };

  await new Promise((r) => setTimeout(r, 700));
  const slug = v.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
  return { ok: true, slug };
}
