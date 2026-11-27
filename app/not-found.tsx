import { Compass } from "lucide-react";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="grid justify-items-center gap-2">
        <Logo />
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="This page doesn't exist or has moved."
          action={<ButtonLink href="/">Go to Alaba home</ButtonLink>}
        />
      </div>
    </main>
  );
}
