import { Gift, Hourglass } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/misc";
import { balance, ledger, loyaltyRules } from "@/lib/loyalty";
import { getMyOrders } from "@/lib/orders";
import { formatDate, formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "Rewards", robots: { index: false } };

export default function RewardsPage() {
  const entries = ledger(getMyOrders());
  const b = balance(entries);
  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-semibold">Alaba Rewards</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="grid gap-1 bg-navy-900 p-5 text-white">
          <p className="flex items-center gap-2 text-sm text-white/80"><Gift className="size-4 text-orange-400" aria-hidden />Available points</p>
          <p className="text-3xl font-semibold tabular-nums">{b.available.toLocaleString()}</p>
          <p className="text-sm text-white/80">Worth {formatNaira(b.valueKobo)} off your next order</p>
        </Card>
        <Card className="grid gap-1 p-5">
          <p className="flex items-center gap-2 text-sm text-gray-600"><Hourglass className="size-4" aria-hidden />Pending</p>
          <p className="text-3xl font-semibold tabular-nums">{b.pending.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Unlocks when you confirm delivery</p>
        </Card>
      </div>
      <Card className="p-5 text-sm text-gray-700">
        <h3 className="mb-2 font-semibold text-navy-900">How it works</h3>
        <ul className="grid gap-1.5">
          <li>• Earn 1 point for every ₦{Math.round(1 / loyaltyRules.pointsPerNaira)} you spend on items.</li>
          <li>• 1 point = ₦{loyaltyRules.nairaPerPoint}. Use them at checkout once you have {loyaltyRules.minRedeemPoints} points.</li>
          <li>• Points can cover up to {Math.round(loyaltyRules.maxRedeemShare * 100)}% of an order and expire after {loyaltyRules.expiryMonths} months.</li>
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 font-semibold">History</h3>
        <ul className="divide-y divide-gray-100 text-sm">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="min-w-0">
                {e.orderNumber ? <Link href={`/account/orders/${e.orderNumber}`} className="font-medium hover:underline">{e.label}</Link> : <span className="font-medium">{e.label}</span>}
                <span className="block text-xs text-gray-500">{formatDate(e.at)}{e.pending ? " · pending" : ""}</span>
              </span>
              <span className={e.pending ? "text-gray-500 tabular-nums" : "font-semibold text-green-700 tabular-nums"}>+{e.points.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
