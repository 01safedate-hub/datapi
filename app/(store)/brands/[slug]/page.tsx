import { BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/store/product-card";
import { Badge, Breadcrumbs, EmptyState } from "@/components/ui/misc";
import { getBrand, getBrands, queryProducts } from "@/lib/catalog";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const b = getBrand((await params).slug);
  if (!b) return { title: "Brand not found" };
  return { title: `${b.name} products`, description: `Shop ${b.name} on Alaba. ${b.description}`, alternates: { canonical: `/brands/${b.slug}` } };
}

export default async function BrandPage({ params }: { params: Params }) {
  const b = getBrand((await params).slug);
  if (!b) notFound();
  const products = queryProducts({ brand: b.slug, sort: "popular" });
  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: b.name }]} />
      <div className="mt-4 grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold">{b.name}</h1>
          {b.official && <Badge tone="info"><BadgeCheck className="size-3.5" aria-hidden />Official brand</Badge>}
        </div>
        <p className="max-w-2xl text-gray-600">{b.description}</p>
      </div>
      <div className="mt-8">
        {products.length ? <ProductGrid products={products} priorityCount={4} /> : <EmptyState icon={BadgeCheck} title="No products yet" description={`${b.name} products will appear here soon.`} />}
      </div>
    </div>
  );
}
