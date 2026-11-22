import { DataTable, PageHeader } from "@/components/admin/ui";
import { auditLog } from "@/lib/data/ops";
import type { AuditEntry } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Audit log" };

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Audit log" description="Every price, stage, refund and permission change, with who did it. Entries can't be edited or deleted." />
      <DataTable<AuditEntry>
        caption="Audit log"
        rows={auditLog}
        rowKey={(a) => a.id}
        columns={[
          { key: "t", header: "When", cell: (a) => <span className="whitespace-nowrap">{formatDateTime(a.at)}</span> },
          { key: "a", header: "Who", cell: (a) => <span className="font-medium">{a.actor}</span> },
          { key: "x", header: "Action", cell: (a) => a.action },
          { key: "g", header: "Target", cell: (a) => <span className="text-gray-600">{a.target}</span> },
        ]}
      />
    </>
  );
}
