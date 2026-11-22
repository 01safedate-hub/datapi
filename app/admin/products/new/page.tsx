import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { categories } from "@/lib/data/catalog";
import { ProductForm } from "../product-form";

export const metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-navy-900"><ChevronLeft className="size-4" aria-hidden /> Products</Link>
      <PageHeader title="Add product" />
      <ProductForm categories={categories} />
    </>
  );
}
