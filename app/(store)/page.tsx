import { ArrowRight, BadgeCheck, Factory, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { CategoryIcon } from "@/components/store/category-icon";
import { HowItWorksSteps } from "@/components/store/how-it-works";
import { ProductGrid } from "@/components/store/product-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/misc";
import { getBestSellers, getCategories, getDeals, getNewArrivals, queryProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

const trust = [
  { icon: ShieldCheck, title: "Buyer Protection", body: "Sellers paid only after delivery" },
  { icon: Factory, title: "Direct from makers", body: "No middlemen, better prices" },
  { icon: Truck, title: "GIG or Jumia", body: "You choose the courier" },
  { icon: MessageCircle, title: "Safe chat", body: "Scam-filtered seller messages" },
];

export default function HomePage() {
  const categories = getCategories();
  const best = getBestSellers(8);
  const fresh = getNewArrivals(4);
  const local = queryProducts({ sellerType: "manufacturer", sort: "popular" }).slice(0, 4);
  const imported = queryProducts({ source: "imported", sort: "popular" }).slice(0, 4);
  const deals = getDeals(4);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: site.url,
            logo: `${site.url}/icons/icon-512.png`,
            email: site.email,
            address: { "@type": "PostalAddress", addressLocality: "Ojo", addressRegion: "Lagos", addressCountry: "NG" },
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.url,
            potentialAction: {
              "@type": "SearchAction",
              target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
              "query-input": "required name=search_term_string",
            },
          },
        ]}
      />

      <section className="container-page pt-6 sm:pt-8">
        <div className="relative overflow-hidden rounded-2xl bg-navy-900 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div aria-hidden className="absolute -top-24 -right-24 size-80 rounded-full bg-brand-600/40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="relative max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
              <span className="size-2 rounded-full bg-orange-500" aria-hidden />
              Nigeria&apos;s marketplace, inspired by Alaba market
            </p>
            <h1 className="text-4xl leading-[1.1] font-semibold sm:text-5xl">Buy direct from Nigerian makers and sellers.</h1>
            <p className="mt-4 text-lg text-white/80">
              Manufacturers, importers and trusted vendors in one place. Wholesale or single items, delivered by GIG or Jumia, and you only release payment when it arrives.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/shop" variant="accent" size="lg">
                Start shopping <ArrowRight className="size-4.5" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/manufacturers" size="lg" className="border border-white/25 bg-transparent hover:bg-white/10">
                Meet the makers
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Why Alaba" className="container-page mt-6">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-3 rounded-card border border-gray-200 p-4">
              <Icon className="size-6 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-gray-600 sm:text-sm">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-14">
        <SectionHeader title="Shop by category" href="/shop" />
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/c/${c.slug}`} className="group flex flex-col items-center gap-3 rounded-card border border-gray-200 px-2 py-5 text-center transition-colors hover:border-navy-900">
                <span className="grid size-12 place-items-center rounded-full bg-gray-100 transition-colors group-hover:bg-navy-900 group-hover:text-white">
                  <CategoryIcon name={c.icon} className="size-5.5" />
                </span>
                <span className="text-xs leading-tight font-medium sm:text-sm">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-14">
        <SectionHeader title="Best sellers" href="/shop?sort=popular" />
        <ProductGrid products={best} priorityCount={4} />
      </section>

      <section className="mt-16 bg-gray-50 py-14">
        <div className="container-page">
          <SectionHeader title="Made in Nigeria" description="Straight from manufacturers. Bulk prices on many items." href="/shop?seller=manufacturer" linkLabel="All manufacturers" />
          <ProductGrid products={local} />
        </div>
      </section>

      {deals.length > 0 && (
        <section className="container-page mt-14">
          <SectionHeader title="Price drops" href="/shop" />
          <ProductGrid products={deals} />
        </section>
      )}

      <section className="container-page mt-14">
        <SectionHeader title="Imported by Alaba" description="Sourced from China by our team, with delivery times shown upfront." href="/shop?source=imported" />
        <ProductGrid products={imported} />
      </section>

      <section className="container-page mt-14">
        <div className="grid gap-4 rounded-2xl bg-orange-50 p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-semibold">Make or sell products? Open your Alaba store.</h2>
            <p className="mt-1 text-gray-700">Free to start. Reach buyers in all 36 states and get paid after every delivery.</p>
          </div>
          <ButtonLink href="/sell" variant="accent" size="lg"><BadgeCheck className="size-4.5" aria-hidden />Start selling</ButtonLink>
        </div>
      </section>

      <section className="container-page mt-14">
        <SectionHeader title="New arrivals" href="/shop?sort=newest" />
        <ProductGrid products={fresh} />
      </section>

      <section className="container-page mt-16">
        <SectionHeader title="How Alaba works" href="/how-it-works" linkLabel="Learn more" />
        <HowItWorksSteps />
      </section>
    </>
  );
}
