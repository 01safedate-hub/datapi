import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell";
import { orders, tickets } from "@/lib/data/ops";
import { payoutRows } from "@/lib/marketplace";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Alaba Admin" },
  robots: { index: false, follow: false },
};

/**
 * Admin area. In production this layout checks the Supabase session and the
 * staff role (and RLS enforces it again in the database).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const counts = {
    "/admin/orders": orders.filter((o) => o.stage === "paid" || o.stage === "awaiting_balance").length,
    "/admin/sourcing": orders.filter((o) => o.stage === "sourcing" || o.stage === "paid").length,
    "/admin/warehouse": orders.filter((o) => o.stage === "china_warehouse").length,
    "/admin/support": tickets.filter((t) => t.status === "open").length,
    "/admin/payouts": payoutRows().filter((p) => p.status === "awaiting_approval").length,
  };
  return <AdminShell counts={counts}>{children}</AdminShell>;
}
