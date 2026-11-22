"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="This page failed to load"
      description={<>Nothing was changed. Try again{error.digest ? <> (ref <code className="text-xs">{error.digest}</code>)</> : null}.</>}
      action={<Button onClick={reset}><RefreshCw className="size-4" aria-hidden /> Try again</Button>}
    />
  );
}
