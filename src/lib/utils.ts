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

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
