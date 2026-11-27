import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/misc";
import { getCategories } from "@/lib/catalog";
import { nigerianStates, subscriptionPlans } from "@/lib/data/settings";
import type { SearchParams } from "@/lib/params";
import { SellerApplication } from "./seller-application";

export const metadata: Metadata = {
  title: "Apply to sell",
  description: "Open your Alaba store as a manufacturer or a vendor.",
  alternates: { canonical: "/sell/apply" },
};

export default async function ApplyPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const plan = typeof sp.plan === "string" && subscriptionPlans.some((p) => p.id === sp.plan) ? sp.plan : "free";
  const type = sp.type === "manufacturer" || sp.type === "vendor" ? sp.type : undefined;
  return (
    <div className="container-page max-w-3xl py-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Sell on Alaba", href: "/sell" }, { label: "Apply" }]} />
      <h1 className="mt-4 text-3xl font-semibold">Open your Alaba store</h1>
      <p className="mt-2 text-gray-600">Takes about 5 minutes. Your answers are saved on this device as you go.</p>
      <SellerApplication
        categories={getCategories().map((c) => ({ slug: c.slug, name: c.name }))}
        states={nigerianStates}
        plans={subscriptionPlans.map((p) => ({ id: p.id, name: p.name, priceKobo: p.priceKobo, listingCap: p.listingCap }))}
        initialPlan={plan}
        initialType={type}
      />
    </div>
  );
}
