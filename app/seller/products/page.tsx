import { Package, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Callout, Card, EmptyState } from "@/components/ui/misc";
import { demoSellerStoreId, listingUsage, sellerProducts } from "@/lib/marketplace";
import { formatNaira } from "@/lib/utils";

export const metadata = { title: "Products" };

export default function SellerProductsPage() {
  const rows = sellerProducts(demoSellerStoreId);
  const u = listingUsage(demoSellerStoreId);
  return (
    <>
      <PageHeader
        title="Products"
        description={`${u.used} of ${u.cap ?? "unlimited"} listings used (${u.plan.name} plan)`}
        actions={u.atCap ? <ButtonLink href="/seller/plan" variant="accent">Upgrade to add more</ButtonLink> : <ButtonLink href="/seller/products/new" variant="accent">Add product</ButtonLink>}
      />
      {u.atCap && <Callout tone="orange" title="Listing limit reached" className="mb-6">Archive a listing or upgrade your plan to add more products.</Callout>}
      {rows.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to open your store." action={<ButtonLink href="/seller/products/new" variant="accent">Add product</ButtonLink>} />
      ) : (
        <ul className="grid gap-3">
          {rows.map((p) => (
            <li key={p.id}>
              <Card className="flex items-center gap-4 p-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gray-100"><Image src={p.image} alt="" fill sizes="56px" className="object-cover" /></span>
                <div className="min-w-0 flex-1">
                  <Link href={`/p/${p.slug}`} target="_blank" className="line-clamp-1 font-medium hover:underline">{p.name}</Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span>from {formatNaira(p.fromKobo)}</span>
                    <span>· {p.variants} variants · {p.stock} in stock · {p.sold} sold</span>
                    {p.freeDelivery && <Badge tone="good">Free delivery</Badge>}
                    {p.videoUrl && <Badge><PlayCircle className="size-3.5" aria-hidden />Video</Badge>}
                    {p.stock < 10 && <Badge tone="warn">Low stock</Badge>}
                  </div>
                </div>
                <Badge tone={p.status === "active" ? "good" : "neutral"} className="capitalize">{p.status}</Badge>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
