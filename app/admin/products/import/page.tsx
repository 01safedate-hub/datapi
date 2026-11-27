import { PageHeader } from "@/components/admin/ui";
import { Callout } from "@/components/ui/misc";
import { categories } from "@/lib/data/catalog";
import { tmpiConfigured } from "@/lib/tmpi";
import { ChinaImport } from "./china-import";

export const metadata = { title: "China import (TMPI)" };

export default function ImportPage() {
  const live = tmpiConfigured();
  return (
    <>
      <PageHeader title="Import from China (TMPI)" description="Imported products are added by Alaba staff only, sold by Alaba Verified and tagged “Imported”. Nothing goes live until you review weight and price." />
      {!live && (
        <Callout tone="warn" title="Sample data" className="mb-6">
          Add <code className="font-mono">TMPI_API_KEY</code> and <code className="font-mono">TMPI_API_URL</code> in Netlify to switch to the live TMPI catalogue. This screen stays the same.
        </Callout>
      )}
      <ChinaImport categories={categories.map(({ slug, name }) => ({ slug, name }))} defaultDays={[10, 18]} />
    </>
  );
}
