import { MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/misc";
import { tickets } from "@/lib/data/ops";
import { getMyOrders } from "@/lib/orders";
import { whatsappLink } from "@/lib/site";
import { formatDateTime } from "@/lib/utils";
import { NewTicket } from "./new-ticket";

export const metadata = { title: "Support" };

export default function SupportPage() {
  const mine = tickets.filter((t) => t.customerName === "Adaeze Okafor");
  const orders = getMyOrders().map((o) => o.number);

  return (
    <div className="grid gap-6">
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <MessageCircle className="size-8 text-brand-600" aria-hidden />
        <div className="flex-1">
          <p className="font-semibold">Fastest answer: WhatsApp</p>
          <p className="text-sm text-gray-600">Mon–Sat, 8am–8pm. Average reply under 10 minutes.</p>
        </div>
        <ButtonLink href={whatsappLink("Hi Shupzy, I need help")} target="_blank" rel="noopener noreferrer" variant="accent">Chat on WhatsApp</ButtonLink>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your requests</h2>
        <NewTicket orders={orders} />
      </div>
      <ul className="grid gap-3">
        {mine.map((t) => (
          <li key={t.id}>
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{t.subject}</p>
                <Badge tone={t.status === "open" ? "warn" : t.status === "pending" ? "info" : "good"} className="capitalize">{t.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-gray-600">{t.lastMessage}</p>
              <p className="mt-1 text-xs text-gray-500">{t.orderNumber ? `${t.orderNumber} · ` : ""}Updated {formatDateTime(t.updatedAt)}</p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
