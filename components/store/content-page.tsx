import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/misc";

export function ContentPage({ title, intro, updated, children }: { title: string; intro?: string; updated?: string; children: ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{title}</h1>
      {intro && <p className="mt-3 text-lg text-gray-600">{intro}</p>}
      {updated && <p className="mt-2 text-sm text-gray-500">Last updated {updated}</p>}
      <div className="mt-8 grid gap-6 text-gray-700 [&_a]:font-medium [&_a]:text-brand-600 [&_a:hover]:underline [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-navy-900 [&_ul:not([class])]:grid [&_ul:not([class])]:gap-1.5 [&_ul:not([class])>li]:ml-5 [&_ul:not([class])>li]:list-disc">
        {children}
      </div>
    </div>
  );
}
