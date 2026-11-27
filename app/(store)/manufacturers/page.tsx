import { BadgeCheck, Factory, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SellerTypeBadge } from "@/components/store/seller-badges";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Breadcrumbs, Card } from "@/components/ui/misc";
import { getStores, queryProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Nigerian manufacturers",
  description: "Buy direct from verified Nigerian manufacturers on Alaba. Wholesale prices, custom branding and bulk orders, with Buyer Protection.",
  alternates: { canonical: "/manufacturers" },
};

export default function ManufacturersPage() {
  const stores = getStores().filter((s) => !s.isPlatform);
  const groups = [
    { title: "Manufacturers", body: "Factories and workshops that make what they sell. Best for bulk, wholesale and custom orders.", items: stores.filter((s) => s.type === "manufacturer") },
    { title: "Vendors & retailers", body: "Shops selling finished, branded goods in smaller quantities.", items: stores.filter((s) => s.type === "vendor") },
  ];
  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Manufacturers & sellers" }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold">Buy direct, skip the middlemen</h1>
          <p className="mt-2 text-gray-600">Like a walk through Alaba market, without the walk. Every seller is checked by Alaba, and you&apos;re covered by Buyer Protection.</p>
        </div>
        <ButtonLink href="/sell" variant="outline"><Factory className="size-4" aria-hidden />List your business</ButtonLink>
      </div>
      {groups.map((g) => (
        <section key={g.title} className="mt-10">
          <h2 className="text-xl font-semibold">{g.title}</h2>
          <p className="mb-4 text-sm text-gray-600">{g.body}</p>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {g.items.map((s) => {
              const count = queryProducts({ store: s.slug }).length;
              return (
                <li key={s.id}>
                  <Card className="grid h-full content-start gap-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/store/${s.slug}`} className="flex items-center gap-1.5 font-semibold hover:underline">
                        {s.name}
                        {s.verified && <BadgeCheck className="size-4 text-brand-600" aria-label="Verified" />}
                      </Link>
                      <SellerTypeBadge type={s.type} />
                    </div>
                    <p className="text-sm text-gray-700">{s.tagline}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="size-3.5" aria-hidden />{s.city}, {s.state} · {count} products · ★ {s.metrics.rating.toFixed(1)}</p>
                    {s.manufacturing && (
                      <div className="flex flex-wrap gap-1.5">
                        {s.manufacturing.customization.slice(0, 2).map((c) => <Badge key={c} tone="orange">{c}</Badge>)}
                        <Badge>MOQ {s.manufacturing.moq.split(" ")[0]}</Badge>
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
