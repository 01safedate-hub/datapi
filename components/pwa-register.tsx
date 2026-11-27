"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/** Registers the service worker and tells the user when a new version is ready. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let reloading = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              toast("A new version of Alaba is available", {
                duration: Infinity,
                action: { label: "Refresh", onClick: () => worker.postMessage({ type: "SKIP_WAITING" }) },
              });
            }
          });
        });
      })
      .catch(() => {
        /* SW is progressive enhancement; the site works without it. */
      });

    const onChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);

  return null;
}
