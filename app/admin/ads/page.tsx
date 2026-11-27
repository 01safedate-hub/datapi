import { PageHeader } from "@/components/admin/ui";
import { Card } from "@/components/ui/misc";
import { adFraudRules, campaigns } from "@/lib/marketplace";
import { platformDefaults } from "@/lib/data/settings";
import { storeById } from "@/lib/data/stores";
import { AdsToggle } from "./ads-toggle";
import { formatNaira } from "@/lib/utils";

export const metadata = { title: "Sponsored ads" };

export default function AdsPage() {
  return (
    <>
      <PageHeader title="Sponsored products" description="Sellers bid for placement in search and category pages: pay per click (CPC), per 1,000 views (CPM) or per confirmed sale (CPA)." />
      <AdsToggle initial={platformDefaults.sponsoredAdsEnabled} />
      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <caption className="sr-only">Campaigns</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs tracking-wide text-gray-600 uppercase">
            <tr><th className="px-4 py-3">Campaign</th><th className="px-4 py-3">Model</th><th className="px-4 py-3 text-right">Bid</th><th className="px-4 py-3 text-right">Clicks (invalid)</th><th className="px-4 py-3 text-right">Sales</th><th className="px-4 py-3 text-right">Spend</th><th className="px-4 py-3 text-right">ROAS</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3"><p className="font-medium">{c.name}</p><p className="text-xs text-gray-500">{storeById(c.storeId).name} · {c.status}</p></td>
                <td className="px-4 py-3 uppercase">{c.model}</td>
                <td className="px-4 py-3 text-right tabular-nums">{c.model === "cpa" ? `${Math.round(c.bid * 100)}% of sale` : formatNaira(c.bid)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{c.stats.clicks.toLocaleString()} <span className="text-gray-400">({c.stats.invalidClicks})</span></td>
                <td className="px-4 py-3 text-right tabular-nums">{c.stats.conversions}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNaira(c.stats.spendKobo)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{(c.stats.salesKobo / c.stats.spendKobo).toFixed(1)}×</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="mt-6 p-5">
        <h2 className="mb-2 font-semibold">Fraud protection</h2>
        <ul className="grid gap-1.5 text-sm text-gray-700">{adFraudRules.map((r) => <li key={r}>• {r}</li>)}</ul>
      </Card>
    </>
  );
}
