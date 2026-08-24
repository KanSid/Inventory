import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function yardsToMeters(yards: number): number {
  return yards * 0.9144;
}

export function formatLength(meters: number): string {
  return `${meters.toFixed(1)}m`;
}

export function formatQuantity(value: number, stockUnit: "roll" | "pieces"): string {
  if (stockUnit === "pieces") return `${Math.round(value)} pc${Math.round(value) !== 1 ? "s" : ""}`;
  return formatLength(value);
}

export function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getRecentMonthOptions(count = 24): { value: string; label: string }[] {
  const now = new Date();
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}
