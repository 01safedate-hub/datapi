import type { Metadata } from "next";
import { getProduct, getStore } from "@/lib/catalog";
import { orders } from "@/lib/data/ops";
import type { SearchParams } from "@/lib/params";
import { MessagesClient } from "./messages-client";

export const metadata: Metadata = {
  title: "Messages",
  description: "Chat with sellers on Alaba. Keep payments on Alaba to stay protected.",
  robots: { index: false },
};

export default async function MessagesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const store = typeof sp.store === "string" ? getStore(sp.store) : undefined;
  const product = typeof sp.product === "string" ? getProduct(sp.product) : undefined;
  // Demo buyer: count completed orders with this seller to drive the trust-pattern warning.
  const completed = store
    ? orders.filter((o) => o.customerId === "cus_01" && o.stage === "delivered" && o.storeOrders.some((so) => so.storeId === store.id)).length
    : 0;

  return (
    <div className="container-page py-4 sm:py-6">
      <h1 className="sr-only">Messages</h1>
      <MessagesClient
        start={
          store
            ? {
                storeSlug: store.slug,
                storeName: store.name,
                completedOrders: completed,
                product: product && product.store.id === store.id ? { slug: product.slug, name: product.name, image: product.images[0]!, priceKobo: product.priceKobo } : undefined,
              }
            : null
        }
      />
    </div>
  );
}
