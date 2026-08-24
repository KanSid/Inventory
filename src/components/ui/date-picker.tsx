"use client";

import { useState } from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function isoToDMY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function DatePicker({
  id,
  value,
  onChange,
  disabled,
  placeholder = "dd/mm/yyyy",
  className,
}: {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [viewYear, setViewYear] = useState(value ? parseIso(value).getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(value ? parseIso(value).getMonth() : today.getMonth());

  function handleOpenChange(next: boolean) {
    if (next) {
      const base = value ? parseIso(value) : new Date();
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
    }
    setOpen(next);
  }

  function handleSelect(day: number) {
    onChange(toIso(viewYear, viewMonth, day));
    setOpen(false);
  }

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString("en-GB", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    // Base UI inserts non-portaled focus-guard elements as siblings of the trigger
    // while the popover is open. A fixed-height wrapper keeps those from growing
    // this component's box and shifting sibling fields in flex layouts.
    <div className="inline-flex h-8">
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Trigger
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <CalendarDays size={14} className="shrink-0 text-muted-foreground" />
          <span className={value ? "" : "text-muted-foreground"}>{value ? isoToDMY(value) : placeholder}</span>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner className="z-50 outline-none" side="bottom" align="start" sideOffset={4}>
            <PopoverPrimitive.Popup className="z-50 w-64 rounded-lg bg-popover p-3 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
              <div className="flex items-center justify-between pb-2">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium">{monthLabel}</span>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {WEEKDAY_LABELS.map((d, i) => (
                  <div key={`${d}-${i}`}>{d}</div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;
                  const iso = toIso(viewYear, viewMonth, day);
                  const isSelected = iso === value;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => handleSelect(day)}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md text-sm hover:bg-muted",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="mt-2 w-full rounded-md py-1 text-center text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
