import { cn } from "@/lib/utils";
import { STOCK_STATUS_COLORS } from "@/lib/constants";

type StockStatus = keyof typeof STOCK_STATUS_COLORS;

interface StatusBadgeProps {
  status: StockStatus;
  className?: string;
}

const labels: Record<StockStatus, string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  phased_out: "Phased Out",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STOCK_STATUS_COLORS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {labels[status]}
    </span>
  );
}
