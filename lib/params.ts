import type { ProductQuery, SortKey } from "./catalog";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | undefined) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
const sorts: SortKey[] = ["popular", "newest", "price-asc", "price-desc", "rating"];

/** Parse and validate listing filters from the URL. Unknown values are ignored, never thrown. */
export function parseListingParams(sp: Record<string, string | string[] | undefined>): ProductQuery {
  const source = one(sp.source);
  const sort = one(sp.sort) as SortKey | undefined;
  return {
    q: one(sp.q)?.slice(0, 100),
    source: source === "imported" || source === "local" ? source : undefined,
    min: num(one(sp.min)),
    max: num(one(sp.max)),
    inStock: one(sp.stock) === "1",
    fast: one(sp.fast) === "1",
    sort: sort && sorts.includes(sort) ? sort : undefined,
    sellerType: one(sp.seller) === "manufacturer" || one(sp.seller) === "vendor" ? (one(sp.seller) as "manufacturer" | "vendor") : undefined,
    verifiedOnly: one(sp.verified) === "1",
    wholesale: one(sp.wholesale) === "1",
    brand: one(sp.brand)?.slice(0, 60),
  };
}
