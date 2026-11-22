"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import type { Customer } from "@/lib/types";

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="grid gap-5 p-5 sm:p-6 md:grid-cols-[220px_minmax(0,1fr)]">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </Card>
  );
}

export function SettingsForms({ customer }: { customer: Customer }) {
  const [profile, setProfile] = useState({ name: customer.name, email: customer.email, phone: customer.phone });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwError, setPwError] = useState("");
  const [prefs, setPrefs] = useState({ whatsapp: true, marketing: customer.marketingOptIn });
  const [saving, start] = useTransition();
  const fake = (msg: string, after?: () => void) =>
    start(async () => {
      await new Promise((r) => setTimeout(r, 500));
      after?.();
      toast.success(msg);
    });

  return (
    <div className="grid gap-6">
      <Section title="Profile" description="Used on orders, receipts and delivery.">
        <Field label="Full name" htmlFor="s-name"><Input id="s-name" autoComplete="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="s-email" hint="Changing it sends a verification email."><Input id="s-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Field>
          <Field label="Phone" htmlFor="s-phone"><Input id="s-phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></Field>
        </div>
        <Button className="w-fit" loading={saving} onClick={() => fake("Profile saved")}>Save profile</Button>
      </Section>

      <Section title="Password" description="Use at least 8 characters.">
        <Field label="Current password" htmlFor="s-cur"><Input id="s-cur" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
        <Field label="New password" htmlFor="s-new" error={pwError}><Input id="s-new" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => { setPw({ ...pw, next: e.target.value }); setPwError(""); }} aria-invalid={!!pwError || undefined} /></Field>
        <Button
          className="w-fit"
          variant="outline"
          onClick={() => {
            if (!pw.current) return setPwError("Enter your current password first");
            if (pw.next.length < 8) return setPwError("New password must be at least 8 characters");
            fake("Password changed", () => setPw({ current: "", next: "" }));
          }}
        >
          Change password
        </Button>
      </Section>

      <Section title="Notifications" description="Order emails are always on, so you never miss an update.">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox className="mt-0.5" checked disabled />
          <span><span className="font-medium">Order updates by email</span><span className="block text-gray-600">Receipts, shipping and delivery updates.</span></span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox className="mt-0.5" checked={prefs.whatsapp} onChange={(e) => { setPrefs({ ...prefs, whatsapp: e.target.checked }); toast.success(e.target.checked ? "WhatsApp updates on" : "WhatsApp updates off"); }} />
          <span><span className="font-medium">Order updates on WhatsApp</span><span className="block text-gray-600">Payment, dispatch, balance reminders and delivery.</span></span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox className="mt-0.5" checked={prefs.marketing} onChange={(e) => { setPrefs({ ...prefs, marketing: e.target.checked }); toast.success(e.target.checked ? "Subscribed to deals" : "Unsubscribed from deals"); }} />
          <span><span className="font-medium">Deals and new arrivals</span><span className="block text-gray-600">At most one email a week.</span></span>
        </label>
      </Section>
    </div>
  );
}
