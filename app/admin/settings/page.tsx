import { PageHeader } from "@/components/admin/ui";
import { SettingsPanel } from "./settings-panel";

export const metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  const has = (k: string) => Boolean(process.env[k]);
  return (
    <>
      <PageHeader title="Settings" description="Business details and connected services." />
      <SettingsPanel
        connections={[
          { name: "Supabase", detail: "Database, auth and storage", ok: has("NEXT_PUBLIC_SUPABASE_URL") },
          { name: "Paystack", detail: "Card, transfer, USSD", ok: has("PAYSTACK_SECRET_KEY") },
          { name: "TMPI", detail: "China product import and price sync", ok: has("TMPI_API_KEY") },
          { name: "GIG Logistics", detail: "Courier (rates set in Settings until API is connected)", ok: true },
          { name: "Jumia Delivery", detail: "Courier and pickup stations (rates set in Settings)", ok: true },
          { name: "Resend", detail: "Transactional email", ok: has("RESEND_API_KEY") },
          { name: "WhatsApp Cloud API", detail: "Order update templates", ok: has("WHATSAPP_ACCESS_TOKEN") },
        ]}
      />
    </>
  );
}
