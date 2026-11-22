"use client";

import { ArrowUpRight, Clock, Search, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchIndexItem } from "@/lib/catalog";
import { useDebounced } from "@/lib/hooks";
import { matchScore } from "@/lib/search";
import { cn, formatNaira } from "@/lib/utils";

const RECENT_KEY = "shupzy-recent-searches";
const popular = ["power bank", "earbuds", "laptop", "air fryer", "sneakers", "rechargeable fan"];

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function SearchBox({ index, className, autoFocus }: { index: SearchIndexItem[]; className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const term = useDebounced(q, 80);
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!term.trim()) return [];
    return index
      .map((p) => ({ p, s: matchScore(term, [p.name, p.brand, p.category, ...p.tags]) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((r) => r.p);
  }, [term, index]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function submit(value: string) {
    const v = value.trim();
    if (!v) return;
    try {
      const next = [v, ...readRecent().filter((r) => r !== v)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(v)}`);
  }

  const showEmpty = !q.trim();
  const options = showEmpty ? [] : results;

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && options[active]) {
            setOpen(false);
            router.push(`/p/${options[active]!.slug}`);
          } else submit(q);
        }}
      >
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search products
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-gray-500" aria-hidden />
        <input
          id={`${listId}-input`}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder="Search phones, laptops, fashion…"
          value={q}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onFocus={() => {
            setRecent(readRecent());
            setOpen(true);
          }}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(options.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 pr-10 pl-10 text-[15px] placeholder:text-gray-500 focus:border-brand-600 focus:bg-white focus:ring-3 focus:ring-brand-600/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-gray-500 hover:bg-gray-200"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] animate-fade-in overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-drawer"
        >
          {showEmpty ? (
            <div className="grid gap-3 p-2">
              {recent.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium tracking-wide text-gray-500 uppercase">Recent</p>
                  <ul className="grid">
                    {recent.map((r) => (
                      <li key={r}>
                        <button type="button" onClick={() => submit(r)} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-gray-50">
                          <Clock className="size-4 text-gray-400" aria-hidden />
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">Popular</p>
                <div className="flex flex-wrap gap-2">
                  {popular.map((p) => (
                    <button key={p} type="button" onClick={() => submit(p)} className="rounded-full border border-gray-200 px-3 py-1 text-sm hover:border-navy-900">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : options.length ? (
            <>
              {options.map((p, i) => (
                <button
                  key={p.slug}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/p/${p.slug}`);
                  }}
                  className={cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", i === active && "bg-gray-50")}
                >
                  <Image src={p.image} alt="" width={44} height={44} className="size-11 rounded-md bg-gray-100" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="text-sm text-gray-500">{formatNaira(p.priceKobo)}</span>
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => submit(q)}
                className="mt-1 flex w-full items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium text-brand-600 hover:bg-gray-50"
              >
                See all results for “{q}”
                <ArrowUpRight className="size-4" aria-hidden />
              </button>
            </>
          ) : (
            <div className="p-4 text-sm text-gray-600">
              <p className="font-medium text-navy-900">No matches for “{q}”</p>
              <p className="mt-1">Check the spelling or try a broader word like “charger” or “bag”.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
