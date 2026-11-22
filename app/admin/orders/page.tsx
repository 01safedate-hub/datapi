import { Suspense } from "react";
import { PageHeader } from "@/components/admin/ui";
import { orders, staff } from "@/lib/data/ops";
import { OrdersTable } from "./orders-table";

export const metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <>
      <PageHeader title="Orders" description={`${orders.length} orders`} />
      <Suspense>
        <OrdersTable orders={orders} staff={staff.map((s) => s.name)} />
      </Suspense>
    </>
  );
}
