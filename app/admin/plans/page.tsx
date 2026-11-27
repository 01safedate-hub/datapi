import { PageHeader } from "@/components/admin/ui";
import { Card } from "@/components/ui/misc";
import { platformDefaults, subscriptionPlans } from "@/lib/data/settings";
import { sellerSummaries } from "@/lib/marketplace";
import { formatNaira } from "@/lib/utils";

export const metadata = { title: "Seller plans" };

export default function PlansPage() {
  const sellers = sellerSummaries().filter((s) => !s.isPlatform);
  return (
    <>
      <PageHeader title="Seller plans" description="Subscriptions set each seller's listing cap and search boost. Commission applies on every plan." />
      <div className="grid gap-4 md:grid-cols-3">
        {subscriptionPlans.map((p) => {
          const n = sellers.filter((s) => s.plan === p.id).length;
          return (
            <Card key={p.id} className="grid gap-2 p-5">
              <p className="font-semibold">{p.name}</p>
              <p className="text-2xl font-semibold tabular-nums">{p.priceKobo ? formatNaira(p.priceKobo) : "Free"}<span className="text-sm font-normal text-gray-500">{p.priceKobo ? "/mo" : ""}</span></p>
              <dl className="grid gap-1 text-sm">
                <div className="flex justify-between"><dt className="text-gray-600">Listing cap</dt><dd>{p.listingCap ?? "Unlimited"}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Search boost</dt><dd>+{Math.round(p.searchBoost * 100)}%</dd></div>
                <div className="flex justify-between"><dt className="text-gray-600">Sellers</dt><dd>{n}</dd></div>
              </dl>
            </Card>
          );
        })}
      </div>
      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-semibold">Commission rates</h2>
        <ul className="grid gap-1 text-sm sm:grid-cols-3">
          <li>Default: <strong>{Math.round(platformDefaults.commission.default * 100)}%</strong></li>
          {Object.entries(platformDefaults.commission.byCategory).map(([k, v]) => <li key={k} className="capitalize">{k}: <strong>{Math.round(v * 100)}%</strong></li>)}
        </ul>
      </Card>
      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-semibold">Listing usage</h2>
        <ul className="grid gap-3">
          {sellers.map((s) => {
            const pct = s.usage.cap ? Math.min(100, Math.round((s.usage.used / s.usage.cap) * 100)) : 4;
            return (
              <li key={s.id} className="grid gap-1 text-sm">
                <div className="flex justify-between"><span>{s.name} · {s.usage.plan.name}</span><span className="tabular-nums">{s.usage.used} / {s.usage.cap ?? "∞"}</span></div>
                <div className="h-1.5 rounded-full bg-gray-100"><div className={`h-full rounded-full ${pct >= 90 ? "bg-orange-500" : "bg-navy-900"}`} style={{ width: `${pct}%` }} /></div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
