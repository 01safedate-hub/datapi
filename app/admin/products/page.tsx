import { Cloud, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { categories, products } from "@/lib/data/catalog";
import { unitPriceKobo } from "@/lib/pricing";
import { ProductsTable, type ProductRow } from "./products-table";

export const metadata = { title: "Products" };

export default function AdminProductsPage() {
  const rows: ProductRow[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0]!,
    category: categories.find((c) => c.slug === p.category)?.name ?? p.category,
    source: p.source,
    origin: p.origin,
    status: p.status,
    availability: p.availability,
    stock: p.source === "local" ? p.stock : null,
    supplierFen: p.supplierPriceFen ?? null,
    priceKobo: unitPriceKobo(p),
    sold: p.sold,
  }));

  return (
    <>
      <PageHeader
        title="Products"
        description={`${rows.length} products · ${rows.filter((r) => r.source === "imported").length} imported, ${rows.filter((r) => r.source === "local").length} local`}
        actions={
          <>
            <ButtonLink href="/admin/products/import" variant="outline"><Cloud className="size-4" aria-hidden /> Import from Alibaba</ButtonLink>
            <ButtonLink href="/admin/products/new"><Plus className="size-4" aria-hidden /> Add product</ButtonLink>
          </>
        }
      />
      <ProductsTable rows={rows} />
    </>
  );
}
