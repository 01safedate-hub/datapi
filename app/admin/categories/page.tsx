import { PageHeader } from "@/components/admin/ui";
import { categories, products } from "@/lib/data/catalog";
import { pricingSettings } from "@/lib/data/settings";
import { CategoryManager } from "./category-manager";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  const rows = categories.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.slug).length,
    markup: Math.round((pricingSettings.categoryMarkup[c.slug] ?? pricingSettings.defaultMarkup) * 100),
  }));
  return (
    <>
      <PageHeader title="Categories" description="Drag order is the order shown in the store menu." />
      <CategoryManager initial={rows} />
    </>
  );
}
