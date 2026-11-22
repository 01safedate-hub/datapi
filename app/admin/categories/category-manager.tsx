"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { slugify } from "@/lib/utils";

type Row = { slug: string; name: string; description: string; count: number; markup: number };

export function CategoryManager({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const move = (i: number, d: -1 | 1) =>
    setRows((r) => {
      const n = [...r];
      [n[i], n[i + d]] = [n[i + d]!, n[i]!];
      return n;
    });

  return (
    <div className="grid gap-4">
      <Card className="divide-y divide-gray-100">
        {rows.map((c, i) => (
          <div key={c.slug} className="flex items-center gap-3 px-4 py-3">
            <div className="flex flex-col">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="text-gray-500 hover:text-navy-900 disabled:opacity-25" aria-label={`Move ${c.name} up`}><ArrowUp className="size-4" /></button>
              <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="text-gray-500 hover:text-navy-900 disabled:opacity-25" aria-label={`Move ${c.name} down`}><ArrowDown className="size-4" /></button>
            </div>
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-gray-500">/c/{c.slug} · {c.count} products · {c.markup}% markup</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={() => {
                if (c.count) return toast.error(`Move the ${c.count} products out of “${c.name}” first`);
                setRows((r) => r.filter((x) => x.slug !== c.slug));
                toast("Category deleted", { action: { label: "Undo", onClick: () => setRows((r) => [...r.slice(0, i), c, ...r.slice(i)]) } });
              }}
            >
              <Trash2 className="size-4" aria-hidden /> Delete
            </Button>
          </div>
        ))}
      </Card>
      <Card className="p-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const slug = slugify(name);
            if (name.trim().length < 2) return setErr("Enter a category name");
            if (rows.some((r) => r.slug === slug)) return setErr("That category already exists");
            setRows((r) => [...r, { slug, name: name.trim(), description: "", count: 0, markup: 20 }]);
            setName("");
            toast.success(`Added “${name.trim()}”`);
          }}
        >
          <Field label="New category" htmlFor="cat-name" error={err} className="min-w-60 flex-1">
            <Input id="cat-name" value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} aria-invalid={!!err || undefined} />
          </Field>
          <Button type="submit"><Plus className="size-4" aria-hidden /> Add</Button>
        </form>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => toast.success("Category order saved")}>Save order</Button>
      </div>
    </div>
  );
}
