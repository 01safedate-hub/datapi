import { BadgeCheck, Clock, Factory, MapPin, MessageCircle, PackageCheck, Star, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductGrid } from "@/components/store/product-card";
import { SellerTypeBadge, timeOnAlaba } from "@/components/store/seller-badges";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Breadcrumbs, Card, EmptyState } from "@/components/ui/misc";
import { getStore, getStores, queryProducts } from "@/lib/catalog";
import { site } from "@/lib/site";
import { formatNaira } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getStores().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const s = getStore((await params).slug);
  if (!s) return { title: "Store not found" };
  const description = `${s.tagline}. ${s.type === "manufacturer" ? "Manufacturer" : "Seller"} in ${s.city}, ${s.state}. Shop with Alaba Buyer Protection.`;
  return { title: s.name, description, alternates: { canonical: `/store/${s.slug}` }, openGraph: { title: s.name, description, url: `/store/${s.slug}` } };
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default async function StorePage({ params }: { params: Params }) {
  const s = getStore((await params).slug);
  if (!s) notFound();
  const products = queryProducts({ store: s.slug, sort: "popular" });
  const t = timeOnAlaba(s.joinedAt);
  const m = s.metrics;
  const stats = [
    { icon: Star, label: "Rating", value: `${m.rating.toFixed(1)} (${m.reviewCount.toLocaleString()})` },
    { icon: PackageCheck, label: "Orders completed", value: m.ordersCompleted.toLocaleString() },
    { icon: Truck, label: "On-time delivery", value: pct(m.onTimeRate) },
    { icon: Clock, label: "Replies within", value: m.responseHours < 1 ? "1 hour" : `${Math.round(m.responseHours)} hours` },
  ];

  return (
    <div className="container-page py-6 sm:py-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Store", name: s.name, description: s.description, url: `${site.url}/store/${s.slug}`, address: { "@type": "PostalAddress", addressLocality: s.city, addressRegion: s.state, addressCountry: "NG" }, aggregateRating: { "@type": "AggregateRating", ratingValue: m.rating, reviewCount: m.reviewCount } }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: s.type === "manufacturer" ? "Manufacturers" : "Stores", href: s.type === "manufacturer" ? "/manufacturers" : "/shop" }, { label: s.name }]} />

      <Card className="mt-5 grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="grid min-w-0 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SellerTypeBadge type={s.type} isPlatform={s.isPlatform} />
            {s.verified && !s.isPlatform && <Badge tone="info"><BadgeCheck className="size-3.5" aria-hidden />Verified business</Badge>}
            {t.isNew && <Badge tone="warn">New seller</Badge>}
          </div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{s.name}</h1>
          <p className="text-gray-700">{s.description}</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            <span className="flex items-center gap-1"><MapPin className="size-4" aria-hidden />{s.city}, {s.state}</span>
            <span>{t.label}</span>
            {s.freeDeliveryOverKobo && <span className="font-medium text-green-700">Free delivery over {formatNaira(s.freeDeliveryOverKobo)}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-2 lg:flex-col lg:items-stretch">
          <ButtonLink href={`/messages?store=${s.slug}`} variant="accent"><MessageCircle className="size-4" aria-hidden />Chat with seller</ButtonLink>
          {s.type === "manufacturer" && <ButtonLink href={`/messages?store=${s.slug}`} variant="outline"><Factory className="size-4" aria-hidden />Request custom order</ButtonLink>}
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-2">
          {stats.map((x) => (
            <div key={x.label} className="rounded-lg bg-gray-50 p-3">
              <dt className="flex items-center gap-1.5 text-xs text-gray-600"><x.icon className="size-3.5" aria-hidden />{x.label}</dt>
              <dd className="mt-1 font-semibold tabular-nums">{x.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-gray-500 lg:col-span-2">Stats are calculated by Alaba from real orders, not entered by the seller.</p>
      </Card>

      {s.manufacturing && (
        <section aria-labelledby="mfg" className="mt-6 grid gap-4 rounded-card border border-gray-200 p-5 sm:p-6">
          <h2 id="mfg" className="flex items-center gap-2 text-lg font-semibold"><Factory className="size-5 text-orange-500" aria-hidden />Manufacturing &amp; bulk orders</h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div><dt className="text-gray-600">Minimum custom order</dt><dd className="font-medium">{s.manufacturing.moq}</dd></div>
            <div><dt className="text-gray-600">Capacity</dt><dd className="font-medium">{s.manufacturing.capacity}</dd></div>
            <div><dt className="text-gray-600">Lead time</dt><dd className="font-medium">{s.manufacturing.leadTime}</dd></div>
          </dl>
          <div className="flex flex-wrap gap-2">
            {s.manufacturing.customization.map((c) => <Badge key={c} tone="orange">{c}</Badge>)}
            {s.manufacturing.certifications.map((c) => <Badge key={c} tone="good"><BadgeCheck className="size-3.5" aria-hidden />{c}</Badge>)}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Products <span className="text-base font-normal text-gray-500">({products.length})</span></h2>
        {products.length ? (
          <ProductGrid products={products} priorityCount={4} />
        ) : (
          <EmptyState icon={PackageCheck} title="No products yet" description="This seller is still setting up their store." action={<ButtonLink href="/shop" variant="outline">Browse all products</ButtonLink>} />
        )}
      </section>
      <p className="mt-10 text-center text-sm text-gray-500">
        Something wrong with this seller? <Link href="/contact" className="text-brand-600 hover:underline">Report them</Link>
      </p>
    </div>
  );
}
