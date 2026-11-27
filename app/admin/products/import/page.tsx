import { PageHeader } from "@/components/admin/ui";
import { Callout } from "@/components/ui/misc";
import { categories } from "@/lib/data/catalog";
import { tmpiConfigured } from "@/lib/tmpi";
import { ChinaImport } from "./china-import";

export const metadata = { title: "China import" };

export default function ImportPage() {
  const live = tmpiConfigured();
  return (
    <>
      <PageHeader title="Import from China" description="Search Alibaba.com or 1688 through TMAPI. Imports are added by Alaba staff only, sold by Alaba Verified and tagged “Imported”. Everything arrives as a draft for you to review." />
      {!live && (
        <Callout tone="warn" title="Sample data" className="mb-6">
          The TMAPI key lives in Supabase (secret <code className="font-mono">TMAPI_KEY</code>). Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">SUPABASE_SECRET_KEY</code> in Netlify so this screen can reach it.
        </Callout>
      )}
      <ChinaImport categories={categories.map(({ slug, name }) => ({ slug, name }))} defaultDays={[10, 18]} />
    </>
  );
}
