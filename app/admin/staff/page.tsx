import { PageHeader } from "@/components/admin/ui";
import { roleLabels, staff } from "@/lib/data/ops";
import { StaffManager } from "./staff-manager";

export const metadata = { title: "Staff & roles" };

const permissions = [
  { key: "orders", label: "Orders & approvals" },
  { key: "products", label: "Products & catalogue" },
  { key: "warehouse", label: "Warehouse & shipments" },
  { key: "support", label: "Customers & support" },
  { key: "finance", label: "Costs, profit & refunds" },
  { key: "settings", label: "Settings & staff" },
] as const;

const matrix: Record<string, string[]> = {
  super_admin: ["orders", "products", "warehouse", "support", "finance", "settings"],
  order_manager: ["orders", "warehouse", "support"],
  product_manager: ["products"],
  warehouse: ["warehouse"],
  support: ["support", "orders"],
  finance: ["finance", "orders"],
};

export default function StaffPage() {
  return (
    <>
      <PageHeader title="Staff & roles" description="Only the Super Admin can see supplier costs and profit unless a role has the finance permission." />
      <StaffManager staff={staff} roleLabels={roleLabels} permissions={[...permissions]} matrix={matrix} />
    </>
  );
}
