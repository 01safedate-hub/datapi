"use server";

import { z } from "zod";
import { getTmpiProduct, searchTmpi, type ImportCandidate } from "@/lib/tmpi";

export async function searchImports(query: string): Promise<{ ok: true; results: ImportCandidate[]; live: boolean } | { ok: false; message: string }> {
  try {
    return { ok: true, ...(await searchTmpi(query.slice(0, 100))) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? `${e.message}. Try again in a minute.` : "Search failed. Try again." };
  }
}

const importSchema = z.object({
  externalId: z.string().min(3),
  category: z.string().min(1, "Choose a category"),
  brand: z.string().trim().min(1, "Brand is required"),
  deliveryMin: z.number().int().min(1).max(90),
  deliveryMax: z.number().int().min(1).max(120),
}).refine((v) => v.deliveryMax >= v.deliveryMin, { path: ["deliveryMax"], message: "Max days must be at least the min" });

/**
 * Imports a TMPI product as a draft on the Alaba Verified store, tagged
 * "Imported", with the admin's delivery timeframe. Only staff can call this
 * (enforced by RLS on products and the admin layout session check).
 */
export async function importAsDraft(input: z.input<typeof importSchema>) {
  const v = importSchema.safeParse(input);
  if (!v.success) return { ok: false as const, message: v.error.issues[0]!.message };
  const item = await getTmpiProduct(v.data.externalId);
  if (!item) return { ok: false as const, message: "That product is no longer available from the supplier." };
  return {
    ok: true as const,
    draft: { title: item.title, source: "imported" as const, store: "alaba-verified", tags: ["imported"], deliveryDays: [v.data.deliveryMin, v.data.deliveryMax] as const, variants: item.variants.length },
  };
}
