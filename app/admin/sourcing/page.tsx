import { PageHeader } from "@/components/admin/ui";
import { products } from "@/lib/data/catalog";
import { orders, suppliers } from "@/lib/data/ops";
import { SourcingQueue, type QueueItem } from "./sourcing-queue";

export const metadata = { title: "Sourcing queue" };

export default function SourcingPage() {
  const items: QueueItem[] = orders
    .filter((o) => o.stage === "paid" || o.stage === "sourcing")
    .flatMap((o) =>
      o.items
        .filter((i) => i.source === "imported")
        .map((i) => ({
          key: `${o.number}-${i.productId}`,
          order: o.number,
          placedAt: o.createdAt,
          name: i.name,
          image: i.image,
          options: Object.values(i.options).join(" · "),
          quantity: i.quantity,
          expectedFen: (i.supplierCostFen ?? 0) * i.quantity,
          origin: products.find((p) => p.id === i.productId)?.origin ?? "manual",
        })),
    );

  return (
    <>
      <PageHeader title="Sourcing queue" description="Paid imported items waiting to be bought from a supplier. Aim for under 48 hours." />
      <SourcingQueue items={items} suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))} />
    </>
  );
}
