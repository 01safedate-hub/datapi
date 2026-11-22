import { PageHeader } from "@/components/admin/ui";
import { Callout } from "@/components/ui/misc";
import { categories } from "@/lib/data/catalog";
import { AlibabaImport } from "./alibaba-import";

export const metadata = { title: "Alibaba import" };

export default function ImportPage() {
  return (
    <>
      <PageHeader title="Import from Alibaba" description="Search the supplier catalogue, then import as a draft. Nothing goes live until you set the category, weight and price." />
      <Callout tone="warn" title="Demo mode" className="mb-6">
        Results below are sample data. Add <code className="font-mono">ALIBABA_API_KEY</code> to switch to the live catalogue; this screen stays the same.
      </Callout>
      <AlibabaImport categories={categories.map(({ slug, name }) => ({ slug, name }))} />
    </>
  );
}
