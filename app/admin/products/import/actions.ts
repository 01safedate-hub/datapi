"use server";

import { z } from "zod";
import { importTmpi, searchTmpi, type ImportCandidate, type ImportResult } from "@/lib/tmpi";

export async function searchImports(query: string, source: "alibaba" | "1688" = "alibaba", page = 1): Promise<{ ok: true; results: ImportCandidate[]; live: boolean } | { ok: false; message: string }> {
  if (!query.trim()) return { ok: false, message: "Type what you're looking for" };
  try {
    return { ok: true, ...(await searchTmpi(query.slice(0, 100), source, page)) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? `${e.message}. Try again in a minute.` : "Search failed. Try again." };
  }
}

const importSchema = z
  .object({
    externalId: z.string().min(3),
    category: z.string().min(1, "Choose a category"),
    brand: z.string().trim().min(1, "Brand is required"),
    deliveryMin: z.number().int().min(1).max(90),
    deliveryMax: z.number().int().min(1).max(120),
    weightKg: z.number().positive().max(200).optional(),
  })
  .refine((v) => v.deliveryMax >= v.deliveryMin, { path: ["deliveryMax"], message: "Max days must be at least the min" });

/**
 * Imports a product as a draft on the Alaba Verified store, tagged "Imported",
 * with the admin's delivery timeframe. Runs in the Supabase `tmapi` function.
 */
export async function importAsDraft(input: z.input<typeof importSchema>): Promise<ImportResult> {
  const v = importSchema.safeParse(input);
  if (!v.success) return { ok: false, msg: v.error.issues[0]!.message };
  try {
    return await importTmpi(v.data);
  } catch (e) {
    return { ok: false, msg: e instanceof Error ? e.message : "Import failed. Try again." };
  }
}
