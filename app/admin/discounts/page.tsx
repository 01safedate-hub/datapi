import { PageHeader } from "@/components/admin/ui";
import { discounts } from "@/lib/data/ops";
import { DiscountManager } from "./discount-manager";

export const metadata = { title: "Discounts" };

export default function DiscountsPage() {
  return (
    <>
      <PageHeader title="Discounts" description="Codes customers enter in the cart. Applied to item prices only, never to shipping." />
      <DiscountManager initial={discounts} />
    </>
  );
}
