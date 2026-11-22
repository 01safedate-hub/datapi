import { ChevronRight, Info, Star, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn, formatNaira } from "@/lib/utils";

const tones = {
  neutral: "bg-gray-100 text-gray-700",
  info: "bg-brand-50 text-brand-600",
  navy: "bg-navy-900 text-white",
  orange: "bg-orange-50 text-orange-600",
  warn: "bg-amber-50 text-amber-700",
  good: "bg-green-50 text-green-700",
  bad: "bg-red-50 text-red-700",
} as const;

export type Tone = keyof typeof tones;

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}
      {...props}
    />
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-card border border-gray-200 bg-white", className)} {...props} />;
}

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-gray-100", className)} {...props} />;
}

export function Separator({ className }: { className?: string }) {
  return <hr className={cn("border-gray-200", className)} />;
}

export function Price({
  kobo,
  compareAt,
  className,
  size = "md",
}: {
  kobo: number;
  compareAt?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const off = compareAt && compareAt > kobo ? Math.round((1 - kobo / compareAt) * 100) : 0;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-semibold tabular-nums", size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-base")}>
        {formatNaira(kobo)}
      </span>
      {off > 0 && (
        <>
          <s className="text-sm text-gray-500 tabular-nums">{formatNaira(compareAt!)}</s>
          <span className="text-sm font-medium text-orange-600">−{off}%</span>
        </>
      )}
    </span>
  );
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm text-gray-600", className)}>
      <Star className="size-4 fill-orange-500 text-orange-500" aria-hidden />
      <span className="font-medium text-navy-900">{value.toFixed(1)}</span>
      {count != null && <span>({count.toLocaleString()})</span>}
      <span className="sr-only">out of 5 stars</span>
    </span>
  );
}

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex", className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={cn("size-4", i <= Math.round(value) ? "fill-orange-500 text-orange-500" : "fill-gray-200 text-gray-200")}
        />
      ))}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-gray-100">
        <Icon className="size-6 text-navy-700" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-gray-600">{description}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export function Callout({
  tone = "info",
  icon: Icon = Info,
  title,
  children,
  className,
}: {
  tone?: "info" | "warn" | "good" | "orange";
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const styles = {
    info: "border-brand-600/20 bg-brand-50 text-navy-900",
    warn: "border-amber-300 bg-amber-50 text-amber-900",
    good: "border-green-300 bg-green-50 text-green-900",
    orange: "border-orange-500/30 bg-orange-50 text-navy-900",
  }[tone];
  return (
    <div className={cn("flex gap-3 rounded-lg border p-3.5 text-sm", styles, className)} role="note">
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="grid gap-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="hover:text-navy-900 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-navy-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHeader({ title, href, linkLabel = "See all", description }: { title: string; href?: string; linkLabel?: string; description?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-gray-600">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-brand-600 hover:underline">
          {linkLabel}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
