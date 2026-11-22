import { PageHeader } from "@/components/admin/ui";
import { categories } from "@/lib/data/catalog";
import { deliveryZones, pricingSettings, shippingAgents } from "@/lib/data/settings";
import { PricingEditor } from "./pricing-editor";

export const metadata = { title: "Pricing rules" };

export default function PricingPage() {
  return (
    <>
      <PageHeader title="Pricing rules" description="Changes apply to new orders only. Existing orders keep the rates they were placed at." />
      <PricingEditor
        settings={{ fxRate: pricingSettings.fxRate, fxUpdatedAt: pricingSettings.fxUpdatedAt, defaultMarkup: pricingSettings.defaultMarkup, categoryMarkup: pricingSettings.categoryMarkup, vat: pricingSettings.vat.enabled }}
        categories={categories.map(({ slug, name }) => ({ slug, name }))}
        agents={shippingAgents}
        zones={deliveryZones}
      />
    </>
  );
}
