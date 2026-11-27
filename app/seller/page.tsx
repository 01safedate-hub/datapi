import { Banknote, MessageCircle, Package, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { Callout, Card } from "@/components/ui/misc";
import { storeById } from "@/lib/data/stores";
import { demoSellerStoreId, listingUsage, payoutRows, sellerOrders } from "@/lib/marketplace";
import { formatNaira } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default function SellerHome() {
  const store = storeById(demoSellerStoreId);
  const usage = listingUsage(store.id);
  const pays = payoutRows(store.id);
  const os = sellerOrders(store.id);
  const sales = os.reduce((s, x) => s + x.so.subtotalKobo, 0);
  const pending = pays.filter((p) => p.status === "held" || p.status === "awaiting_approval").reduce((s, p) => s + p.netKobo, 0);
  return (
    <>
      <PageHeader title={`Welcome, ${store.name}`} description={`${store.type === "manufacturer" ? "Manufacturer" : "Vendor"} · ${store.city}, ${store.state}`} actions={<ButtonLink href="/seller/products/new" variant="accent">Add product</ButtonLink>} />
      {usage.remaining != null && usage.remaining <= 5 && (
        <Callout tone="orange" title={`${usage.remaining} listings left on ${usage.plan.name}`} className="mb-6">
          <Link href="/seller/plan" className="font-medium underline">Upgrade your plan</Link> to list more products.
        </Callout>
      )}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Sales" value={formatNaira(sales)} icon={ShoppingCart} sub={`${os.length} orders`} />
        <StatCard label="Pending payouts" value={formatNaira(pending)} icon={Banknote} sub="Released after delivery is confirmed" />
        <StatCard label="Listings" value={`${usage.used} / ${usage.cap ?? "∞"}`} icon={Package} sub={`${usage.plan.name} plan`} />
        <StatCard label="Rating" value={store.metrics.rating.toFixed(1)} icon={Star} sub={`Replies in ~${store.metrics.responseHours}h`} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="grid gap-2 p-5">
          <h2 className="font-semibold">How you get paid</h2>
          <p className="text-sm text-gray-600">Buyers pay Alaba. When the buyer confirms delivery (or 72 hours pass without a dispute), Alaba approves your payout and sends it to your bank account, minus commission.</p>
          <Link href="/seller/payouts" className="text-sm font-medium text-brand-600 hover:underline">View payouts</Link>
        </Card>
        <Card className="grid gap-2 p-5">
          <h2 className="flex items-center gap-2 font-semibold"><MessageCircle className="size-4.5 text-brand-600" aria-hidden />Keep chats on Alaba</h2>
          <p className="text-sm text-gray-600">Phone numbers, emails, links and bank details are hidden automatically. Asking buyers to pay you directly will suspend your payouts.</p>
          <Link href="/seller/messages" className="text-sm font-medium text-brand-600 hover:underline">Open messages</Link>
        </Card>
      </div>
    </>
  );
}
