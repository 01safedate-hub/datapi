import { brands, stores } from "@/lib/data/stores";
import { ChevronLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { categories, products } from "@/lib/data/catalog";
import { ProductForm } from "../product-form";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const p = products.find((x) => x.id === id);
  return { title: p ? `Edit ${p.name}` : "Product" };
}

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <>
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-navy-900"><ChevronLeft className="size-4" aria-hidden /> Products</Link>
      <PageHeader
        title="Edit product"
        description={product.name}
        actions={<ButtonLink href={`/p/${product.slug}`} target="_blank" variant="outline" size="sm"><ExternalLink className="size-4" aria-hidden /> View in store</ButtonLink>}
      />
      <ProductForm product={product} categories={categories} brands={brands.map((b) => ({ slug: b.slug, name: b.name }))} stores={stores.map((s) => ({ id: s.id, name: s.name }))} />
    </>
  );
}
