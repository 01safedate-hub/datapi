"use client";

import { MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/sheet";

type Address = { id: string; label: string; name: string; line1: string; city: string; state: string; phone: string; isDefault: boolean };

const blank = { label: "", name: "", line1: "", city: "", state: "", phone: "", isDefault: false };

export function AddressBook({ initial, states }: { initial: Address[]; states: string[] }) {
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState<Address | null>(null);
  const [draft, setDraft] = useState<Omit<Address, "id">>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const open = editing !== null;

  function startEdit(a: Address | null) {
    setEditing(a ?? { id: "", ...blank });
    setDraft(a ? { ...a } : blank);
    setErrors({});
  }

  function save() {
    const e: Record<string, string> = {};
    if (!draft.name.trim()) e.name = "Enter the recipient's name";
    if (draft.line1.trim().length < 5) e.line1 = "Enter a street address";
    if (!draft.city.trim()) e.city = "Enter a city or area";
    if (!draft.state) e.state = "Choose a state";
    if (draft.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number";
    setErrors(e);
    if (Object.keys(e).length) return;
    const id = editing?.id || `a${Date.now()}`;
    const entry = { ...draft, id, label: draft.label || "Address" };
    setList((l) => {
      const next = editing?.id ? l.map((a) => (a.id === id ? entry : a)) : [...l, entry];
      return entry.isDefault ? next.map((a) => ({ ...a, isDefault: a.id === id })) : next;
    });
    setEditing(null);
    toast.success(editing?.id ? "Address updated" : "Address added");
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Saved addresses</h2>
        <Button size="sm" onClick={() => startEdit(null)}><Plus className="size-4" aria-hidden /> Add address</Button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((a) => (
          <li key={a.id}>
            <Card className="flex h-full flex-col p-5 text-sm">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="size-4.5 text-brand-600" aria-hidden />
                <p className="font-semibold">{a.label}</p>
                {a.isDefault && <Badge tone="navy">Default</Badge>}
              </div>
              <p className="text-gray-700">{a.name}<br />{a.line1}<br />{a.city}, {a.state}<br />{a.phone}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(a)}>Edit</Button>
                {!a.isDefault && (
                  <Button size="sm" variant="ghost" onClick={() => { setList((l) => l.map((x) => ({ ...x, isDefault: x.id === a.id }))); toast.success(`${a.label} is now your default`); }}>
                    Set as default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setList((l) => l.filter((x) => x.id !== a.id));
                    toast("Address removed", { action: { label: "Undo", onClick: () => setList((l) => [...l, a]) } });
                  }}
                >
                  Remove
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Sheet open={open} onClose={() => setEditing(null)} title={editing?.id ? "Edit address" : "New address"} footer={<Button className="w-full" onClick={save}>Save address</Button>}>
        <div className="grid gap-4">
          <Field label="Label" htmlFor="a-label" optional>
            <Input id="a-label" placeholder="Home, Office…" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          </Field>
          <Field label="Recipient name" htmlFor="a-name" error={errors.name}>
            <Input id="a-name" autoComplete="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} aria-invalid={!!errors.name || undefined} />
          </Field>
          <Field label="Street address" htmlFor="a-line1" error={errors.line1}>
            <Input id="a-line1" autoComplete="street-address" value={draft.line1} onChange={(e) => setDraft({ ...draft, line1: e.target.value })} aria-invalid={!!errors.line1 || undefined} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City / area" htmlFor="a-city" error={errors.city}>
              <Input id="a-city" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} aria-invalid={!!errors.city || undefined} />
            </Field>
            <Field label="State" htmlFor="a-state" error={errors.state}>
              <Select id="a-state" value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })} aria-invalid={!!errors.state || undefined}>
                <option value="">Choose</option>
                {states.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Phone" htmlFor="a-phone" error={errors.phone}>
            <Input id="a-phone" type="tel" autoComplete="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} aria-invalid={!!errors.phone || undefined} />
          </Field>
          <label className="flex items-center gap-2.5 text-sm">
            <Checkbox checked={draft.isDefault} onChange={(e) => setDraft({ ...draft, isDefault: e.target.checked })} />
            Use as my default address
          </label>
        </div>
      </Sheet>
    </div>
  );
}
