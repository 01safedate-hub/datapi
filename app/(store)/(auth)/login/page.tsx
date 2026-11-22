import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function Page() {
  return (
    <div className="container-page pb-12">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
