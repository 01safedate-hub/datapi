import { BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/misc";
import { getBrands, queryProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Brands",
  description: "Shop by brand on Alaba, including official brand stores registered by the brand owners.",
  alternates: { canonical: "/brands" },
};

export default function BrandsPage() {
  const brands = getBrands().map((b) => ({ ...b, count: queryProducts({ brand: b.slug }).length })).filter((b) => b.count > 0 || b.official);
  const official = brands.filter((b) => b.official);
  const rest = brands.filter((b) => !b.official);
  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-semibold">Brands</h1>
        <ButtonLink href="/brands/register" variant="outline">Register your brand</ButtonLink>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><BadgeCheck className="size-5 text-brand-600" aria-hidden />Official brands</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {official.map((b) => (
            <li key={b.slug}>
              <Link href={`/brands/${b.slug}`} className="grid h-full gap-1 rounded-card border border-gray-200 p-4 hover:border-navy-900">
                <span className="font-semibold">{b.name}</span>
                <span className="text-xs text-gray-500">{b.count} products · {b.country}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10">
        <h2 className="mb-3 font-semibold">All brands</h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4 lg:grid-cols-6">
          {rest.map((b) => (
            <li key={b.slug}><Link href={`/brands/${b.slug}`} className="hover:text-brand-600 hover:underline">{b.name} <span className="text-gray-400">({b.count})</span></Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
