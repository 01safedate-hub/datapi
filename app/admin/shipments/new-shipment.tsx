"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { shippingAgents } from "@/lib/data/settings";

const ready = ["SHZ-10500", "SHZ-10495"];

export function NewShipment() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [waybill, setWaybill] = useState("");

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden /> New shipment</Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="New air shipment"
        footer={
          <Button
            className="w-full"
            disabled={!picked.length}
            onClick={() => {
              setOpen(false);
              toast.success(`Shipment created with ${picked.length} order${picked.length > 1 ? "s" : ""}`, { description: waybill ? "Customers notified with tracking." : "Add the waybill when the flight is booked." });
              setPicked([]);
            }}
          >
            Create shipment
          </Button>
        }
      >
        <div className="grid gap-4">
          <Field label="Shipping agent" htmlFor="ns-agent">
            <Select id="ns-agent">{shippingAgents.filter((a) => a.active).map((a) => <option key={a.id}>{a.name}</option>)}</Select>
          </Field>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Weighed parcels ready to fly</legend>
            {ready.map((n) => (
              <label key={n} className="flex items-center gap-2.5 py-1.5 text-sm">
                <Checkbox checked={picked.includes(n)} onChange={(e) => setPicked((p) => (e.target.checked ? [...p, n] : p.filter((x) => x !== n)))} />
                {n}
              </label>
            ))}
          </fieldset>
          <Field label="Air waybill" htmlFor="ns-awb" optional hint="You can add this later.">
            <Input id="ns-awb" value={waybill} onChange={(e) => setWaybill(e.target.value)} placeholder="176-…" />
          </Field>
        </div>
      </Sheet>
    </>
  );
}
