"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "left" | "right" | "bottom";
  children: ReactNode;
  footer?: ReactNode;
};

/** Accessible drawer built on the native <dialog> element (focus trap, Esc, inert background). */
export function Sheet({ open, onClose, title, side = "right", children, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const position = {
    left: "mr-auto h-dvh max-h-dvh w-[min(22rem,88vw)]",
    right: "ml-auto h-dvh max-h-dvh w-[min(26rem,92vw)]",
    bottom: "mt-auto w-full max-w-none max-h-[85dvh] rounded-t-2xl",
  }[side];

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={cn(
        "m-0 flex-col bg-white p-0 text-navy-900 shadow-drawer backdrop:bg-navy-950/40 backdrop:backdrop-blur-[1px] open:flex open:animate-slide-up",
        position,
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="border-t border-gray-200 px-5 py-4 pb-safe">{footer}</div>}
    </dialog>
  );
}
