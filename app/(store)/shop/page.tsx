import type { Metadata } from "next";
import { Listing } from "@/components/store/listing";
import { parseListingParams, type SearchParams } from "@/lib/params";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Browse imported and locally stocked products with naira prices and shipping shown upfront.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseListingParams(await searchParams);
  const title = query.source === "local" ? "Fast local delivery" : query.source === "imported" ? "Imported from China" : "All products";
  return (
    <Listing
      title={title}
      description={query.source === "local" ? "In stock in Lagos and delivered in 1–4 days." : undefined}
      query={query}
      crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
    />
  );
}
