import { PageHeader } from "@/components/admin/ui";
import { getBrands, queryProducts } from "@/lib/catalog";
import { BrandManager } from "./brand-manager";

export const metadata = { title: "Brands" };

export default function AdminBrandsPage() {
  const brands = getBrands().map((b) => ({ ...b, products: queryProducts({ brand: b.slug }).length }));
  return (
    <>
      <PageHeader title="Brands" description="Every product needs a brand. Add brands here; official brands are registered by their owners through /brands/register and verified by staff." />
      <BrandManager initial={brands} pending={[{ ref: "BRD-40217", name: "Lagos Denim Co.", owner: "LDC Apparel Ltd", trademark: "NG/TM/O/2026/03311", role: "owner" }]} />
    </>
  );
}
