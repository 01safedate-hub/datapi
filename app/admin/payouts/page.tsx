import { PageHeader, StatCard } from "@/components/admin/ui";
import { Banknote, Clock, ShieldAlert } from "lucide-react";
import { payoutRows } from "@/lib/marketplace";
import { formatNaira } from "@/lib/utils";
import { PayoutQueue } from "./payout-queue";

export const metadata = { title: "Payouts" };

export default function PayoutsPage() {
  const rows = payoutRows();
  const sum = (s: string) => rows.filter((r) => r.status === s).reduce((t, r) => t + r.netKobo, 0);
  return (
    <>
      <PageHeader title="Payouts" description="Alaba Buyer Protection: sellers are paid only after delivery is confirmed by the buyer, or after the 72-hour window closes with no dispute." />
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Ready to approve" value={formatNaira(sum("awaiting_approval"))} icon={Banknote} tone={sum("awaiting_approval") ? "warn" : "default"} />
        <StatCard label="Held (in transit)" value={formatNaira(sum("held"))} icon={Clock} />
        <StatCard label="Frozen (disputes)" value={formatNaira(sum("frozen"))} icon={ShieldAlert} />
        <StatCard label="Paid this month" value={formatNaira(sum("paid"))} icon={Banknote} />
      </div>
      <PayoutQueue rows={rows} />
    </>
  );
}
