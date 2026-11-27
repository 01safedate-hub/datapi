"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";

export function ExportButton({ rows }: { rows: Record<string, string | number>[] }) {
  return (
    <Button
      variant="outline"
      onClick={() => {
        downloadCsv(`alaba-pnl-${new Date().toISOString().slice(0, 10)}.csv`, rows);
        toast.success("Report exported", { description: "Opens in Excel or Google Sheets." });
      }}
    >
      <Download className="size-4" aria-hidden /> Export CSV
    </Button>
  );
}
