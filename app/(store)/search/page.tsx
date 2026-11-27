import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Listing } from "@/components/store/listing";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { getCategories } from "@/lib/catalog";
import { parseListingParams, type SearchParams } from "@/lib/params";
import { whatsappLink } from "@/lib/site";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q } = parseListingParams(await searchParams);
  return { title: q ? `Results for “${q}”` : "Search", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseListingParams(await searchParams);
  const q = query.q?.trim();

  return (
    <Listing
      title={q ? <>Results for “{q}”</> : "Search"}
      query={query}
      crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      empty={
        <EmptyState
          icon={SearchX}
          title={q ? `We couldn't find “${q}”` : "What are you looking for?"}
          description={
            <>
              Check the spelling, try a more general word, or browse a category:{" "}
              {getCategories().map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && ", "}
                  <Link href={`/c/${c.slug}`} className="text-brand-600 hover:underline">{c.name}</Link>
                </span>
              ))}
              .
            </>
          }
          action={
            <>
              <ButtonLink href="/shop">Browse all products</ButtonLink>
              <ButtonLink href={whatsappLink(`Hi Alaba, I'm looking for: ${q ?? ""}`)} variant="outline" target="_blank" rel="noopener noreferrer">
                Ask us on WhatsApp
              </ButtonLink>
            </>
          }
        />
      }
    />
  );
}
