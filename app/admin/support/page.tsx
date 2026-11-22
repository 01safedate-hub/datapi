import { PageHeader } from "@/components/admin/ui";
import { tickets } from "@/lib/data/ops";
import { TicketInbox } from "./ticket-inbox";

export const metadata = { title: "Support" };

export default function SupportAdminPage() {
  return (
    <>
      <PageHeader title="Support" description="Replies are emailed to the customer and saved on the order." />
      <TicketInbox tickets={tickets} />
    </>
  );
}
