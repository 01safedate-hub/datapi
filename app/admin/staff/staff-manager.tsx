"use client";

import { Check, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/sheet";
import type { Staff } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type Props = { staff: Staff[]; roleLabels: Record<string, string>; permissions: { key: string; label: string }[]; matrix: Record<string, string[]> };

export function StaffManager({ staff: initial, roleLabels, permissions, matrix: initialMatrix }: Props) {
  const [staff, setStaff] = useState(initial);
  const [matrix, setMatrix] = useState(initialMatrix);
  const [open, setOpen] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", role: "support" });
  const [err, setErr] = useState<Record<string, string>>({});

  return (
    <div className="grid gap-6">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}><UserPlus className="size-4" aria-hidden /> Invite staff</Button></div>
      <Card className="divide-y divide-gray-100">
        {staff.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="grid size-9 place-items-center rounded-full bg-navy-900 text-sm font-semibold text-white">{s.name.charAt(0)}</span>
            <div className="min-w-40 flex-1">
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-gray-500">{s.email} · active {formatDateTime(s.lastActiveAt)}</p>
            </div>
            {s.role === "super_admin" ? (
              <Badge tone="navy">Super Admin</Badge>
            ) : (
              <Select aria-label={`Role for ${s.name}`} value={s.role} onChange={(e) => { setStaff((l) => l.map((x) => (x.id === s.id ? { ...x, role: e.target.value as Staff["role"] } : x))); toast.success(`${s.name} is now ${roleLabels[e.target.value]}`); }} className="h-9 w-auto text-sm">
                {Object.entries(roleLabels).filter(([k]) => k !== "super_admin").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            )}
          </div>
        ))}
      </Card>

      <div>
        <h2 className="mb-3 font-semibold">Permission matrix</h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <caption className="sr-only">Permissions by role</caption>
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-600">
              <tr><th className="px-4 py-3 text-left font-medium uppercase">Role</th>{permissions.map((p) => <th key={p.key} className="px-3 py-3 font-medium">{p.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.keys(matrix).map((role) => (
                <tr key={role}>
                  <th scope="row" className="px-4 py-3 text-left font-medium">{roleLabels[role]}</th>
                  {permissions.map((p) => (
                    <td key={p.key} className="px-3 py-3 text-center">
                      {role === "super_admin" ? (
                        <Check className="mx-auto size-4 text-green-700" aria-label="Allowed" />
                      ) : (
                        <Checkbox
                          aria-label={`${roleLabels[role]}: ${p.label}`}
                          checked={matrix[role]!.includes(p.key)}
                          onChange={(e) => setMatrix((m) => ({ ...m, [role]: e.target.checked ? [...m[role]!, p.key] : m[role]!.filter((x) => x !== p.key) }))}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <div className="mt-3 flex justify-end"><Button variant="outline" onClick={() => toast.success("Permissions saved", { description: "Logged in the audit trail." })}>Save permissions</Button></div>
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Invite staff"
        footer={
          <Button
            className="w-full"
            onClick={() => {
              const e: Record<string, string> = {};
              if (invite.name.trim().length < 2) e.name = "Enter their name";
              if (!/^\S+@\S+\.\S+$/.test(invite.email)) e.email = "Enter a valid email";
              setErr(e);
              if (Object.keys(e).length) return;
              setStaff((l) => [...l, { id: `stf_${Date.now()}`, name: invite.name, email: invite.email, role: invite.role as Staff["role"], lastActiveAt: new Date().toISOString() }]);
              setOpen(false);
              toast.success(`Invite sent to ${invite.email}`);
              setInvite({ name: "", email: "", role: "support" });
            }}
          >
            Send invite
          </Button>
        }
      >
        <div className="grid gap-4">
          <Field label="Name" htmlFor="i-name" error={err.name}><Input id="i-name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} aria-invalid={!!err.name || undefined} /></Field>
          <Field label="Email" htmlFor="i-email" error={err.email}><Input id="i-email" type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} aria-invalid={!!err.email || undefined} /></Field>
          <Field label="Role" htmlFor="i-role">
            <Select id="i-role" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
              {Object.entries(roleLabels).filter(([k]) => k !== "super_admin").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
        </div>
      </Sheet>
    </div>
  );
}
