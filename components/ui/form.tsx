import { AlertCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 text-[15px] text-navy-900 placeholder:text-gray-400 transition-colors " +
  "hover:border-gray-400 focus:border-brand-600 focus:ring-3 focus:ring-brand-600/15 focus:outline-none " +
  "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/15 disabled:bg-gray-50 disabled:text-gray-500";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 py-2.5", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        control,
        "h-11 appearance-none bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%230a1a52' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-[right_0.75rem_center] bg-no-repeat pr-10",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium text-navy-900", className)} {...props} />;
}

export function Checkbox({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <input
      type="checkbox"
      className={cn("size-4.5 shrink-0 cursor-pointer rounded border-gray-300 accent-navy-900", className)}
      {...props}
    />
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label + control + hint/error, wired for screen readers. */
export function Field({ label, htmlFor, error, hint, optional, className, children }: FieldProps) {
  return (
    <div className={cn("grid content-start gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {optional && <span className="ml-1 font-normal text-gray-500">(optional)</span>}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-gray-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
