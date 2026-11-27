"use client";

import { CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";

export function ContactForm() {
  const [v, setV] = useState({ name: "", email: "", order: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  if (sent) {
    return (
      <div role="status" className="flex gap-3 rounded-card border border-green-300 bg-green-50 p-5 text-green-900">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden />
        <p>Thanks, {v.name.split(" ")[0]}. We&apos;ve received your message and will reply to {v.email} within 2 working hours.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const err: Record<string, string> = {};
        if (v.name.trim().length < 2) err.name = "Enter your name";
        if (!/^\S+@\S+\.\S+$/.test(v.email)) err.email = "Enter a valid email so we can reply";
        if (v.message.trim().length < 10) err.message = "Tell us a little more (10+ characters)";
        setErrors(err);
        if (Object.keys(err).length) return;
        start(async () => {
          await new Promise((r) => setTimeout(r, 600));
          setSent(true);
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name" error={errors.name}><Input id="c-name" autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} aria-invalid={!!errors.name || undefined} /></Field>
        <Field label="Email" htmlFor="c-email" error={errors.email}><Input id="c-email" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} aria-invalid={!!errors.email || undefined} /></Field>
      </div>
      <Field label="Order number" htmlFor="c-order" optional><Input id="c-order" placeholder="ALB-…" value={v.order} onChange={(e) => setV({ ...v, order: e.target.value })} /></Field>
      <Field label="Message" htmlFor="c-message" error={errors.message}><Textarea id="c-message" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} aria-invalid={!!errors.message || undefined} /></Field>
      <Button type="submit" className="w-fit" loading={pending}>Send message</Button>
    </form>
  );
}
