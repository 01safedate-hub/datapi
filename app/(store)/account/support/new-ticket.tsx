"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";

export function NewTicket({ orders }: { orders: string[] }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  function submit() {
    const e: Record<string, string> = {};
    if (subject.trim().length < 4) e.subject = "Add a short subject";
    if (message.trim().length < 10) e.message = "Tell us a bit more (10+ characters)";
    setErrors(e);
    if (Object.keys(e).length) return;
    start(async () => {
      await new Promise((r) => setTimeout(r, 600));
      setOpen(false);
      setSubject("");
      setMessage("");
      toast.success("Request sent", { description: "We reply within 2 working hours by email." });
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden /> New request</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="New support request" footer={<Button className="w-full" loading={pending} onClick={submit}>Send</Button>}>
        <div className="grid gap-4">
          <Field label="Order" htmlFor="t-order" optional>
            <Select id="t-order" value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="">Not about an order</option>
              {orders.map((o) => <option key={o}>{o}</option>)}
            </Select>
          </Field>
          <Field label="Subject" htmlFor="t-subject" error={errors.subject}>
            <Input id="t-subject" value={subject} onChange={(e) => setSubject(e.target.value)} aria-invalid={!!errors.subject || undefined} />
          </Field>
          <Field label="Message" htmlFor="t-message" error={errors.message}>
            <Textarea id="t-message" value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={!!errors.message || undefined} />
          </Field>
        </div>
      </Sheet>
    </>
  );
}
