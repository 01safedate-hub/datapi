import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { Callout, Card } from "@/components/ui/misc";
import { platformDefaults } from "@/lib/data/settings";
import { campaigns, demoSellerStoreId } from "@/lib/marketplace";
import { formatNaira } from "@/lib/utils";

export const metadata = { title: "Sponsored ads" };

export default function SellerAdsPage() {
  const mine = campaigns.filter((c) => c.storeId === demoSellerStoreId);
  const a = platformDefaults.ads;
  return (
    <>
      <PageHeader title="Sponsored ads" description="Promote products in search and category pages." />
      {!platformDefaults.sponsoredAdsEnabled && (
        <Callout tone="orange" icon={Megaphone} title="Coming soon" className="mb-6">
          You can set up campaigns now. They start showing (and billing) when Alaba switches sponsored products on. You won&apos;t be charged before then.
        </Callout>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { t: "Pay per click (CPC)", b: `From ${formatNaira(a.cpc.minBidKobo)} per click. Repeat clicks from the same buyer within ${a.clickDedupeHours}h are free.` },
          { t: "Pay per 1,000 views (CPM)", b: `From ${formatNaira(a.cpm.minBidKobo)} per 1,000 impressions. Good for new product launches.` },
          { t: "Pay per sale (CPA)", b: `From ${Math.round(a.cpa.minRate * 100)}% of the sale, charged only after the buyer confirms delivery.` },
        ].map((x) => <Card key={x.t} className="grid gap-1 p-5"><p className="font-semibold">{x.t}</p><p className="text-sm text-gray-600">{x.b}</p></Card>)}
      </div>
      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-semibold">Your campaigns</h2>
        {mine.length === 0 ? <p className="text-sm text-gray-500">No campaigns yet.</p> : (
          <ul className="grid gap-2 text-sm">
            {mine.map((c) => (
              <li key={c.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-gray-200 p-3">
                <span><strong>{c.name}</strong> · {c.model.toUpperCase()} · {c.status}</span>
                <span className="tabular-nums text-gray-600">{c.stats.conversions} sales · {formatNaira(c.stats.spendKobo)} spent · {(c.stats.salesKobo / c.stats.spendKobo).toFixed(1)}× return</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
