import { PageHeader } from "@/components/admin/ui";
import { Callout } from "@/components/ui/misc";
import { getBrands, getCategories } from "@/lib/catalog";
import { demoSellerStoreId, listingUsage } from "@/lib/marketplace";
import { ListingForm } from "./listing-form";

export const metadata = { title: "Add product" };

export default function NewListingPage() {
  const u = listingUsage(demoSellerStoreId);
  return (
    <>
      <PageHeader title="Add product" description="Imported products from China are listed by Alaba only. Your listings ship from your location." />
      {u.atCap ? (
        <Callout tone="orange" title="Listing limit reached">Upgrade your plan or archive a listing first.</Callout>
      ) : (
        <ListingForm brands={getBrands().map((b) => ({ slug: b.slug, name: b.name }))} categories={getCategories().map((c) => ({ slug: c.slug, name: c.name }))} remaining={u.remaining} />
      )}
    </>
  );
}
