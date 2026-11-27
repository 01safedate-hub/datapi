import { PageHeader } from "@/components/admin/ui";
import { Callout } from "@/components/ui/misc";
import { scanMessage } from "@/lib/scam";
import { SafetyTester } from "./safety-tester";

export const metadata = { title: "Chat safety" };

const flagged = [
  { at: "26 Nov, 15:10", store: "Lekki Gadget Hub", buyer: "Adaeze O.", text: "Since you're a regular customer, send to my GTB 0123456789 and I'll give you 10% off", orders: 2 },
  { at: "25 Nov, 09:42", store: "Arewa Home Appliances", buyer: "Musa I.", text: "Call me 0803 555 1234 let's talk price", orders: 0 },
  { at: "24 Nov, 18:05", store: "Arewa Home Appliances", buyer: "Grace E.", text: "Add me on whatsapp so I can send more pictures", orders: 1 },
];

export default function ChatSafetyPage() {
  return (
    <>
      <PageHeader title="Chat safety" description="Messages that tried to share contact details or move payment off Alaba. Contact details are hidden from the other party automatically." />
      <Callout title="Trust-pattern watch" className="mb-6">
        Off-platform requests from sellers who already have 2+ completed orders with the buyer are ranked first. That&apos;s the most common scam pattern: build trust, then ask for direct payment.
      </Callout>
      <ul className="grid gap-3">
        {flagged.sort((a, b) => b.orders - a.orders).map((f) => {
          const r = scanMessage(f.text);
          return (
            <li key={f.at} className="grid gap-2 rounded-card border border-gray-200 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{f.store} → {f.buyer}</p>
                <p className="text-xs text-gray-500">{f.at}{f.orders >= 2 && <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 font-medium text-red-700">{f.orders} prior orders</span>}</p>
              </div>
              <p className="rounded-lg bg-gray-50 p-3 font-mono text-xs">{f.text}</p>
              <p className="text-xs text-gray-600">Buyer saw: <span className="font-mono">{r.safeText}</span></p>
              <p className="flex flex-wrap gap-1.5">{r.flags.map((x) => <span key={x.kind + x.match} className={`rounded px-1.5 py-0.5 text-xs ${x.severity === "block" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{x.kind.replace(/_/g, " ")}</span>)}</p>
            </li>
          );
        })}
      </ul>
      <SafetyTester />
    </>
  );
}
