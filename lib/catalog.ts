import "server-only";
import { categories, products } from "./data/catalog";
import { reviews } from "./data/reviews";
import { estShippingKobo, unitPriceKobo } from "./pricing";
import { matchScore } from "./search";
import type { Category, Product, PublicProduct, Review } from "./types";

/**
 * Catalogue data access. Today it reads the mock catalogue; swap the bodies
 * for Supabase queries without touching any page.
 */

export function toPublic(p: Product): PublicProduct {
  const { supplierPriceFen: _cost, priceKobo: _local, ...rest } = p;
  return { ...rest, priceKobo: unitPriceKobo(p), estShippingKobo: estShippingKobo(p) };
}

const live = () => products.filter((p) => p.status === "active");

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug) ?? null;
}

export function getProduct(slug: string): PublicProduct | null {
  const p = live().find((x) => x.slug === slug);
  return p ? toPublic(p) : null;
}

export function getProductById(id: string): PublicProduct | null {
  const p = products.find((x) => x.id === id);
  return p ? toPublic(p) : null;
}

export function getReviews(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

export type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

export type ProductQuery = {
  q?: string;
  category?: string;
  source?: "imported" | "local";
  min?: number;
  max?: number;
  inStock?: boolean;
  fast?: boolean;
  sort?: SortKey;
};

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export function queryProducts(query: ProductQuery = {}): PublicProduct[] {
  let list = live().map(toPublic);
  let scores: Map<string, number> | null = null;

  if (query.q?.trim()) {
    scores = new Map();
    for (const p of list) {
      const s = matchScore(query.q, [p.name, p.brand, p.category, ...p.tags]);
      if (s > 0) scores.set(p.id, s);
    }
    list = list.filter((p) => scores!.has(p.id));
  }
  if (query.category) list = list.filter((p) => p.category === query.category);
  if (query.source) list = list.filter((p) => p.source === query.source);
  if (query.min != null) list = list.filter((p) => p.priceKobo >= query.min! * 100);
  if (query.max != null) list = list.filter((p) => p.priceKobo <= query.max! * 100);
  if (query.inStock) list = list.filter((p) => p.availability !== "out_of_stock");
  if (query.fast) list = list.filter((p) => p.deliveryDays[1] <= 4);

  const sort = query.sort ?? (scores ? undefined : "popular");
  const sorters: Record<SortKey, (a: PublicProduct, b: PublicProduct) => number> = {
    popular: (a, b) => b.sold - a.sold,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    "price-asc": (a, b) => a.priceKobo - b.priceKobo,
    "price-desc": (a, b) => b.priceKobo - a.priceKobo,
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  };
  if (sort) list.sort(sorters[sort]);
  else if (scores) list.sort((a, b) => (scores!.get(b.id) ?? 0) - (scores!.get(a.id) ?? 0) || b.sold - a.sold);
  return list;
}

export function getRelated(product: PublicProduct, limit = 4) {
  return queryProducts({ category: product.category })
    .filter((p) => p.id !== product.id)
    .slice(0, limit);
}

export function getNewArrivals(limit = 8) {
  return queryProducts({ sort: "newest" }).slice(0, limit);
}

export function getBestSellers(limit = 8) {
  return queryProducts({ sort: "popular" }).slice(0, limit);
}

export function getDeals(limit = 8) {
  return queryProducts({}).filter((p) => p.compareAtKobo && p.compareAtKobo > p.priceKobo).slice(0, limit);
}

/** Lightweight index sent to the search box for instant suggestions. */
export function getSearchIndex() {
  return live().map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    tags: p.tags,
    image: p.images[0]!,
    priceKobo: unitPriceKobo(p),
  }));
}

export type SearchIndexItem = ReturnType<typeof getSearchIndex>[number];
