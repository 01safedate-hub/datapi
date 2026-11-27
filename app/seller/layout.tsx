import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell";
import { storeById } from "@/lib/data/stores";
import { demoSellerStoreId, payoutRows, sellerOrders } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: { default: "Seller", template: "%s · Alaba Seller" },
  robots: { index: false, follow: false },
};

/** Seller centre. Production: requires a signed-in store member (RLS scopes every query to their store_id). */
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const store = storeById(demoSellerStoreId);
  const counts = {
    "/seller/orders": sellerOrders(store.id).filter(({ so }) => so.payout === "held" && !so.trackingNumber).length,
    "/seller/payouts": payoutRows(store.id).filter((p) => p.status === "awaiting_approval").length,
  };
  return (
    <AdminShell variant="seller" subtitle={store.name} counts={counts}>
      {children}
    </AdminShell>
  );
}
