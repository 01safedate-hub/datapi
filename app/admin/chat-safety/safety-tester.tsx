"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { scanMessage } from "@/lib/scam";

export function SafetyTester() {
  const [t, setT] = useState("Pay me directly: zero eight zero three 123 4567, or john dot doe at gmail dot com");
  const r = scanMessage(t);
  return (
    <Card className="mt-8 grid gap-3 p-5">
      <h2 className="font-semibold">Test the filter</h2>
      <Textarea aria-label="Message to test" value={t} onChange={(e) => setT(e.target.value)} className="min-h-20" />
      <p className="text-sm"><span className="text-gray-600">Result:</span> <strong className={r.blocked ? "text-red-600" : r.flags.length ? "text-amber-700" : "text-green-700"}>{r.blocked ? "Hidden" : r.flags.length ? "Delivered with warning" : "Clean"}</strong></p>
      <p className="rounded-lg bg-gray-50 p-3 font-mono text-xs">{r.safeText}</p>
    </Card>
  );
}
