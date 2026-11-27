"use client";

import { Megaphone } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

export function AdsToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <Card className={cn("flex flex-wrap items-center gap-4 p-5", on ? "border-green-300 bg-green-50" : "")}>
      <Megaphone className={cn("size-6", on ? "text-green-700" : "text-gray-400")} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Sponsored products are {on ? "ON" : "OFF"}</p>
        <p className="text-sm text-gray-600">{on ? "Sponsored listings appear in search and category pages, clearly labelled “Sponsored”." : "Built and ready. Keep this off until traffic justifies ads; sellers can set up campaigns meanwhile, but nothing is shown or billed."}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Sponsored products"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await new Promise((r) => setTimeout(r, 500));
            setOn(!on);
            toast.success(on ? "Sponsored products turned off" : "Sponsored products turned on", { description: "Saved to platform settings (demo: this session only)." });
          })
        }
        className={cn("relative h-7 w-12 rounded-full transition-colors disabled:opacity-60", on ? "bg-green-600" : "bg-gray-300")}
      >
        <span className={cn("absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform", on && "translate-x-5")} />
      </button>
    </Card>
  );
}
