"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** Label for the "clear" option. Pass null to hide it (required fields). */
  noneLabel?: string | null;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  noneLabel = "— None —",
  className,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) => {
    const q = search.toLowerCase();
    return o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q);
  });

  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function select(val: string) {
    onValueChange(val);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn("flex-1 text-left truncate", !selectedLabel && "text-muted-foreground")}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground pointer-events-none" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-36 rounded-lg border bg-popover text-popover-foreground shadow-lg">
          <div className="border-b p-1.5">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-7 w-full rounded-md border border-input bg-transparent pl-7 pr-2 text-sm outline-none focus:border-ring"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            {noneLabel != null && (
              <button
                type="button"
                onClick={() => select("")}
                className={cn(
                  "relative flex w-full items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !value && "bg-accent/40"
                )}
              >
                {noneLabel}
                {!value && <Check className="absolute right-2 size-3.5" />}
              </button>
            )}

            {filtered.length === 0 ? (
              <p className="py-3 text-center text-xs text-muted-foreground">No results</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => select(o.value)}
                  className={cn(
                    "relative flex w-full flex-col items-start rounded-md py-1.5 pr-8 pl-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    value === o.value && "bg-accent/40"
                  )}
                >
                  <span>{o.label}</span>
                  {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
                  {value === o.value && <Check className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
