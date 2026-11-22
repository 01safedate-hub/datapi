import { SearchX } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs, EmptyState, Skeleton } from "@/components/ui/misc";
import { getCategories, queryProducts, sortOptions, type ProductQuery } from "@/lib/catalog";
import { ProductGrid } from "./product-card";
import { FilterSidebar, ListingToolbar } from "./filters";

type Props = {
  title: ReactNode;
  description?: string;
  query: ProductQuery;
  crumbs: { label: string; href?: string }[];
  showCategories?: boolean;
  empty?: ReactNode;
};

export function Listing({ title, description, query, crumbs, showCategories = true, empty }: Props) {
  const products = queryProducts(query);
  const cats = showCategories ? getCategories().map(({ slug, name }) => ({ slug, name })) : undefined;

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs items={crumbs} />
      <div className="mt-3 mb-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-gray-600">{description}</p>}
      </div>
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Suspense fallback={<div className="hidden lg:block" />}>
          <FilterSidebar categories={cats} />
        </Suspense>
        <div>
          <Suspense fallback={<Skeleton className="h-9 w-full" />}>
            <ListingToolbar total={products.length} sortOptions={sortOptions} categories={cats} />
          </Suspense>
          <div className="mt-6">
            {products.length ? (
              <ProductGrid products={products} priorityCount={4} />
            ) : (
              empty ?? (
                <EmptyState
                  icon={SearchX}
                  title="No products match these filters"
                  description="Try removing a filter or widening the price range."
                  action={<ButtonLink href="?" variant="outline">Clear filters</ButtonLink>}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
