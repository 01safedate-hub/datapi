"use client";

import { CheckCircle2, CircleDashed } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/misc";
import { site } from "@/lib/site";

export function SettingsPanel({ connections }: { connections: { name: string; detail: string; ok: boolean }[] }) {
  const [biz, setBiz] = useState({ name: site.name, email: site.email, phone: site.phone, whatsapp: site.whatsapp, address: site.address });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="grid content-start gap-4 p-5">
        <h2 className="font-semibold">Business details</h2>
        <p className="-mt-2 text-sm text-gray-600">Shown in the footer, emails and invoices.</p>
        {([["name", "Business name"], ["email", "Support email"], ["phone", "Phone"], ["whatsapp", "WhatsApp number (international, no +)"], ["address", "Address"]] as const).map(([k, l]) => (
          <Field key={k} label={l} htmlFor={`b-${k}`}><Input id={`b-${k}`} value={biz[k]} onChange={(e) => setBiz({ ...biz, [k]: e.target.value })} /></Field>
        ))}
        <Button className="w-fit" onClick={() => toast.success("Business details saved")}>Save</Button>
      </Card>
      <Card className="grid content-start gap-4 p-5">
        <h2 className="font-semibold">Connections</h2>
        <p className="-mt-2 text-sm text-gray-600">Add keys in your hosting environment variables. See <code className="font-mono text-xs">.env.example</code>.</p>
        <ul className="divide-y divide-gray-100">
          {connections.map((c) => (
            <li key={c.name} className="flex items-center gap-3 py-3">
              {c.ok ? <CheckCircle2 className="size-5 text-green-600" aria-hidden /> : <CircleDashed className="size-5 text-gray-400" aria-hidden />}
              <div className="flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-gray-500">{c.detail}</p>
              </div>
              {c.ok ? <Badge tone="good">Connected</Badge> : <Badge tone="warn">Demo mode</Badge>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
