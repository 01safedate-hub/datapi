import { PageHeader } from "@/components/admin/ui";
import { storeById } from "@/lib/data/stores";
import { subscriptionPlans } from "@/lib/data/settings";
import { demoSellerStoreId, listingUsage } from "@/lib/marketplace";
import { PlanPicker } from "./plan-picker";

export const metadata = { title: "Plan & listings" };

export default function SellerPlanPage() {
  const store = storeById(demoSellerStoreId);
  const u = listingUsage(store.id);
  return (
    <>
      <PageHeader title="Plan & listings" description={`You're using ${u.used} of ${u.cap ?? "unlimited"} listings on the ${u.plan.name} plan.`} />
      <PlanPicker plans={subscriptionPlans} current={u.plan.id} used={u.used} />
    </>
  );
}
