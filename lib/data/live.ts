import type { Availability, Brand, Product, ProductOption, Variant, WholesaleTier } from "../types";
import { brands, storeBySlug } from "./stores";

/**
 * Live catalogue rows from Supabase, read with the public (RLS-limited) key.
 * Only active products are visible to this key. Loaded once per server
 * instance and merged into the catalogue; a failed fetch leaves the
 * catalogue as it was rather than breaking the build.
 */

// Publishable values only: safe in the browser, limited by row-level security.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type Row = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  brand_slug: string | null;
  description: string | null;
  highlights: string[];
  specs: Record<string, string>;
  category: string;
  source: "imported" | "local";
  origin: string;
  status: "active" | "draft" | "archived";
  supplier_price_fen: number | null;
  price_kobo: number | null;
  compare_at_kobo: number | null;
  est_weight_g: number;
  dims_cm: number[];
  moq: number;
  stock: number;
  availability: Availability;
  delivery_days: string;
  options: ProductOption[];
  created_at: string;
  wholesale: WholesaleTier[];
  free_delivery: boolean;
  condition: Product["condition"];
  warranty: string | null;
  video_url: string | null;
  tags: string[];
  stores: { slug: string } | null;
  product_media: { path: string; sort: number }[];
  product_variants: {
    id: string;
    sku: string;
    options: Record<string, string>;
    supplier_price_fen: number | null;
    price_kobo: number | null;
    compare_at_kobo: number | null;
    stock: number;
    active: boolean;
  }[];
};

type BrandRow = { slug: string; name: string; official: boolean; country: string; description: string | null };

async function get<T>(path: string): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      // sb_publishable_ keys are not JWTs: send them only as the apikey header.
      headers: SUPABASE_KEY.startsWith("sb_")
        ? { apikey: SUPABASE_KEY }
        : { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn(`[live] ${path.split("?")[0]}: HTTP ${res.status}`);
      return [];
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.warn(`[live] ${path.split("?")[0]}: ${(err as Error).message}`);
    return [];
  }
}

/** Postgres int4range text such as "[2,6)" → inclusive [2, 5]. */
function parseRange(r: string): [number, number] {
  const m = /^([[(])(\d*),(\d*)([\])])$/.exec(r ?? "");
  if (!m) return [2, 5];
  const lo = Number(m[2]) + (m[1] === "(" ? 1 : 0);
  const hi = Number(m[3]) - (m[4] === ")" ? 1 : 0);
  return [lo, Math.max(lo, hi)];
}

function toProduct(r: Row): Product {
  const storeId = storeBySlug(r.stores?.slug ?? "alaba-verified")?.id ?? "str_alaba";
  const media = [...r.product_media].sort((a, b) => a.sort - b.sort).map((m) => m.path);
  const activeVariants = r.product_variants.filter((v) => v.active);
  const variants: Variant[] = activeVariants.length
    ? activeVariants.map((v) => ({
        id: v.id,
        sku: v.sku,
        options: v.options,
        supplierPriceFen: v.supplier_price_fen ?? r.supplier_price_fen ?? undefined,
        priceKobo: v.price_kobo ?? r.price_kobo ?? undefined,
        compareAtKobo: v.compare_at_kobo ?? r.compare_at_kobo ?? undefined,
        stock: v.stock,
      }))
    : [
        {
          id: `${r.id}#0`,
          sku: `ALB-${r.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 12)}`,
          options: {},
          supplierPriceFen: r.supplier_price_fen ?? undefined,
          priceKobo: r.price_kobo ?? undefined,
          compareAtKobo: r.compare_at_kobo ?? undefined,
          stock: r.stock,
        },
      ];
  const dims = (r.dims_cm ?? [0, 0, 0]).slice(0, 3) as [number, number, number];
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand_slug ?? (r.brand ?? "generic").toLowerCase().replace(/\s+/g, "-"),
    storeId,
    category: r.category,
    source: r.source,
    origin: r.origin === "alibaba" ? "alibaba" : "manual",
    status: r.status,
    description: r.description ?? "",
    highlights: r.highlights ?? [],
    specs: r.specs ?? {},
    images: media.length ? media : ["/logo-mark.png"],
    supplierPriceFen: r.supplier_price_fen ?? undefined,
    priceKobo: r.price_kobo ?? undefined,
    compareAtKobo: r.compare_at_kobo ?? undefined,
    estWeightKg: r.est_weight_g / 1000,
    dimsCm: dims,
    moq: r.moq,
    stock: r.stock,
    availability: r.availability,
    deliveryDays: parseRange(r.delivery_days),
    options: r.options ?? [],
    variants,
    wholesale: r.wholesale ?? [],
    freeDelivery: r.free_delivery,
    videoUrl: r.video_url ?? undefined,
    condition: r.condition,
    warranty: r.warranty ?? undefined,
    rating: 0,
    reviewCount: 0,
    sold: 0,
    createdAt: r.created_at,
    tags: r.tags ?? [],
  };
}

const select =
  "*,stores(slug),product_media(path,sort),product_variants(id,sku,options,supplier_price_fen,price_kobo,compare_at_kobo,stock,active)";

const [productRows, brandRows] = await Promise.all([
  get<Row>(`products?select=${encodeURIComponent(select)}&status=eq.active&order=created_at.desc`),
  get<BrandRow>("brands?select=slug,name,official,country,description"),
]);

// Brands registered in Supabase join the brand directory.
for (const b of brandRows) {
  if (brands.some((x) => x.slug === b.slug)) continue;
  const brand: Brand = { slug: b.slug, name: b.name, official: b.official, country: b.country, description: b.description ?? "" };
  brands.push(brand);
}

export const liveProducts: Product[] = productRows.map(toProduct);
