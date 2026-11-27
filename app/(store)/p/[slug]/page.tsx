import { BadgeCheck, CalendarClock, PackageCheck, Plane, PlayCircle, ShieldCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { Gallery } from "@/components/store/gallery";
import { ProductGrid, SourceBadge } from "@/components/store/product-card";
import { ProductPurchase } from "@/components/store/product-purchase";
import { Badge, Breadcrumbs, Callout, Rating, SectionHeader, Stars } from "@/components/ui/misc";
import { getCategory, getProduct, getRelated, getReviews, queryProducts } from "@/lib/catalog";
import { parseVideoLink } from "@/lib/video";
import { SellerCard } from "@/components/store/seller-card";
import { site } from "@/lib/site";
import { formatDate, formatKg, formatNaira } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return queryProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return { title: "Product not found" };
  const description = `${p.description} ${formatNaira(p.priceKobo)}${p.source === "imported" ? ` + est. ${formatNaira(p.estShippingKobo)} shipping` : ""}. Delivered in ${p.deliveryDays[0]}–${p.deliveryDays[1]} days.`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/p/${p.slug}` },
    openGraph: { type: "website", title: p.name, description, url: `/p/${p.slug}` },
    twitter: { card: "summary_large_image", title: p.name, description },
    other: {
      "product:price:amount": String(p.priceKobo / 100),
      "product:price:currency": "NGN",
      "product:availability": p.availability === "out_of_stock" ? "out of stock" : p.availability === "preorder" ? "preorder" : "in stock",
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const category = getCategory(p.category);
  const reviews = getReviews(p.id);
  const related = getRelated(p);
  const imported = p.source === "imported";
  const video = p.videoUrl ? parseVideoLink(p.videoUrl) : null;

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.description,
            sku: p.variants[0]?.sku ?? p.id,
            brand: { "@type": "Brand", name: p.brandName },
            category: category?.name,
            image: p.images.map((i) => `${site.url}${i}`),
            aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount },
            offers: {
              "@type": "Offer",
              url: `${site.url}/p/${p.slug}`,
              priceCurrency: "NGN",
              price: (p.priceKobo / 100).toFixed(2),
              ...(p.variants.length > 1 ? { "@type": "AggregateOffer", lowPrice: (p.priceKobo / 100).toFixed(2), highPrice: (Math.max(...p.variants.map((v) => v.priceKobo)) / 100).toFixed(2), offerCount: p.variants.length } : {}),
              availability:
                p.availability === "out_of_stock"
                  ? "https://schema.org/OutOfStock"
                  : p.availability === "preorder"
                    ? "https://schema.org/PreOrder"
                    : "https://schema.org/InStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: { "@type": "Organization", name: p.store.name },
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: site.url },
              { "@type": "ListItem", position: 2, name: category?.name, item: `${site.url}/c/${p.category}` },
              { "@type": "ListItem", position: 3, name: p.name },
            ],
          },
        ]}
      />

      <div className="container-page py-6 sm:py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: category?.name ?? "Shop", href: `/c/${p.category}` }, { label: p.name }]} />

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          <Gallery images={p.images} name={p.name} />

          <div className="grid content-start gap-6">
            <div className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <SourceBadge source={p.source} />
                {p.availability === "preorder" && <Badge tone="navy">Pre-order</Badge>}
                {p.availability === "out_of_stock" && <Badge tone="bad">Sold out</Badge>}
                <Link href={`/brands/${p.brand}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:underline">
                  {p.brandName}
                  {p.brandOfficial && <BadgeCheck className="size-3.5 text-brand-600" aria-label="Official brand" />}
                </Link>
              </div>
              <h1 className="text-2xl leading-tight font-semibold sm:text-3xl">{p.name}</h1>
              <a href="#reviews" className="w-fit hover:underline">
                <Rating value={p.rating} count={p.reviewCount} />
                <span className="ml-2 text-sm text-gray-500">· {p.sold.toLocaleString()} sold</span>
              </a>
            </div>

            <ProductPurchase product={p} />

            <SellerCard store={p.store} productSlug={p.slug} />

            <ul className="grid gap-3 rounded-card bg-gray-50 p-5 text-sm">
              <li className="flex gap-3">
                <CalendarClock className="size-5 shrink-0 text-brand-600" aria-hidden />
                <span>
                  <strong className="font-semibold">Arrives in {p.deliveryDays[0]}–{p.deliveryDays[1]} days</strong>
                  <span className="block text-gray-600">
                    {imported ? "Imported from China: our warehouse → Lagos by air, then to your door." : `Ships from ${p.store.city}, ${p.store.state}.`}
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <Truck className="size-5 shrink-0 text-brand-600" aria-hidden />
                <span>{p.freeDelivery ? "Free delivery: shipping is included in the price." : "Delivered by GIG Logistics or Jumia Delivery, your choice at checkout."}</span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="size-5 shrink-0 text-brand-600" aria-hidden />
                <span>
                  <strong className="font-semibold">Alaba Buyer Protection.</strong> The seller is only paid after you confirm delivery. Pay on Alaba only.{" "}
                  <Link href="/buyer-protection" className="text-brand-600 hover:underline">How it works</Link>
                </span>
              </li>
              {p.warranty && (
                <li className="flex gap-3">
                  <BadgeCheck className="size-5 shrink-0 text-brand-600" aria-hidden />
                  <span>{p.warranty}</span>
                </li>
              )}
            </ul>

            {video && (
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-3 rounded-card border border-gray-200 p-4 text-sm hover:border-navy-900"
              >
                <PlayCircle className="size-8 shrink-0 text-orange-500" aria-hidden />
                <span className="grid">
                  <span className="font-semibold">Watch the product video</span>
                  <span className="text-gray-600">On {video.platform === "tiktok" ? "TikTok" : "Instagram"}. Opens in a new tab.</span>
                </span>
              </a>
            )}
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section aria-labelledby="about">
            <h2 id="about" className="mb-3 text-xl font-semibold">About this product</h2>
            <p className="text-gray-700">{p.description}</p>
            <ul className="mt-4 grid gap-2">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-2.5">
                  <PackageCheck className="mt-0.5 size-4.5 shrink-0 text-orange-500" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="specs">
            <h2 id="specs" className="mb-3 text-xl font-semibold">Specifications</h2>
            <dl className="divide-y divide-gray-200 rounded-card border border-gray-200 text-sm">
              {Object.entries({ Brand: p.brandName, Condition: p.condition === "new" ? "Brand new" : p.condition === "refurbished" ? "Refurbished" : "Used", ...p.specs, ...(p.warranty ? { Warranty: p.warranty } : {}), "Weight": formatKg(p.estWeightKg), "Package size": `${p.dimsCm.join(" × ")} cm` }).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[40%_1fr] gap-4 px-4 py-2.5">
                  <dt className="text-gray-600">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {imported && (
          <Callout icon={Plane} title="How imported orders work" className="mt-10">
            Imported products are sourced and stocked by Alaba only. After you pay, we buy from the supplier within 48 hours; your item is checked and weighed at our China warehouse, flown to Lagos, cleared through customs and delivered in about {p.deliveryDays[0]}–{p.deliveryDays[1]} days. You get an email and WhatsApp update at every step.{" "}
            <Link href="/how-it-works" className="font-medium text-brand-600 hover:underline">Learn more</Link>
          </Callout>
        )}

        <section id="reviews" aria-labelledby="reviews-title" className="mt-14 scroll-mt-32">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2 id="reviews-title" className="text-xl font-semibold">Customer reviews</h2>
            <div className="flex items-center gap-2">
              <Stars value={p.rating} />
              <span className="text-sm text-gray-600">{p.rating.toFixed(1)} from {p.reviewCount.toLocaleString()} reviews</span>
            </div>
          </div>
          <ul className="grid gap-4 md:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-card border border-gray-200 p-5">
                <Stars value={r.rating} />
                <p className="mt-2 font-semibold">{r.title}</p>
                <p className="mt-1 text-sm text-gray-700">{r.body}</p>
                <p className="mt-3 text-xs text-gray-500">
                  {r.author}, {r.city} · {formatDate(r.createdAt)}
                  {r.verified && <span className="ml-1 font-medium text-green-700">· Verified purchase</span>}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <SectionHeader title="You may also like" href={`/c/${p.category}`} />
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </>
  );
}
