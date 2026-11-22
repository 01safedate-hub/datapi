import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing } from "@/components/store/listing";
import { getCategories, getCategory } from "@/lib/catalog";
import { parseListingParams, type SearchParams } from "@/lib/params";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `${category.description} Naira prices, shipping shown upfront, delivered across Nigeria.`,
    alternates: { canonical: `/c/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  const query = { ...parseListingParams(await searchParams), category: category.slug };
  return (
    <Listing
      title={category.name}
      description={category.description}
      query={query}
      showCategories={false}
      crumbs={[{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: category.name }]}
    />
  );
}
