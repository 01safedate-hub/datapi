"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { whatsappLink } from "@/lib/site";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-8">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong on our side"
        description={
          <>
            Your cart is safe. Try again, or tell us what happened{error.digest ? <> (reference <code className="text-xs">{error.digest}</code>)</> : null}.
          </>
        }
        action={
          <>
            <Button onClick={reset}><RefreshCw className="size-4" aria-hidden /> Try again</Button>
            <ButtonLink href={whatsappLink(`Hi Shupzy, I hit an error${error.digest ? ` (ref ${error.digest})` : ""}`)} variant="outline" target="_blank" rel="noopener noreferrer">
              Get help
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
