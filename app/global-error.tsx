"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-NG">
      <body className="grid min-h-dvh place-items-center p-6 text-center font-sans">
        <div className="grid max-w-sm gap-3">
          <h1 className="text-2xl font-semibold">Shupzy hit a problem</h1>
          <p className="text-gray-600">Your cart is saved on this device. Please try again.</p>
          <button type="button" onClick={reset} className="mx-auto h-11 rounded-lg bg-navy-900 px-5 font-medium text-white">
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
