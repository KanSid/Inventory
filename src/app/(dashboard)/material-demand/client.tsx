"use client";

import { Fragment, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatDate, formatQuantity } from "@/lib/utils";

export type DemandLine = {
  id: string;
  bride_name: string;
  quantity: number;
  current_stage: string | null;
  order_status: string | null;
  wedding_date: string | null;
  store: string | null;
  note: string | null;
};

export type DemandGroup = {
  product_id: string;
  item_code: string;
  description: string;
  stock_unit: "roll" | "pieces";
  current_stock: number;
  stock_status: string;
  total_demanded: number;
  lines: DemandLine[];
};

const STATUS_BADGE: Record<string, string> = {
  in_stock: "bg-emerald-100 text-emerald-700",
  low_stock: "bg-amber-100 text-amber-700",
  out_of_stock: "bg-red-100 text-red-700",
  phased_out: "bg-gray-200 text-gray-600",
  unknown: "bg-gray-100 text-gray-500",
};

function prettyStage(key: string | null): string {
  if (!key) return "—";
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MaterialDemandTable({
  data,
  defaultExpanded = false,
}: {
  data: DemandGroup[];
  defaultExpanded?: boolean;
}) {
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(defaultExpanded ? data.map((g) => g.product_id) : [])
  );

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8" />
          <TableHead>Product</TableHead>
          <TableHead className="text-right">Demanded</TableHead>
          <TableHead className="text-right">In Stock</TableHead>
          <TableHead className="text-right">Coverage</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Orders</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((g) => {
          const isOpen = open.has(g.product_id);
          const coverage = g.current_stock - g.total_demanded;
          const short = coverage < 0;
          return (
            <Fragment key={g.product_id}>
              <TableRow
                className="cursor-pointer"
                aria-expanded={isOpen}
                onClick={() => toggle(g.product_id)}
              >
                <TableCell>
                  <ChevronRight
                    size={15}
                    className={cn(
                      "text-muted-foreground transition-transform",
                      isOpen && "rotate-90"
                    )}
                  />
                </TableCell>
                <TableCell>
                  <span className="font-serif">{g.item_code}</span>
                  {g.description && (
                    <span className="text-muted-foreground text-xs ml-2">
                      {g.description}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-serif">
                  {formatQuantity(g.total_demanded, g.stock_unit)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatQuantity(g.current_stock, g.stock_unit)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-serif",
                    short ? "text-red-600" : "text-emerald-700"
                  )}
                >
                  {short ? "−" : "+"}
                  {formatQuantity(Math.abs(coverage), g.stock_unit)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                      STATUS_BADGE[g.stock_status] ?? STATUS_BADGE.unknown
                    )}
                  >
                    {g.stock_status.replace(/_/g, " ")}
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {g.lines.length}
                </TableCell>
              </TableRow>

              {isOpen && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="bg-muted/20 p-0">
                    <div className="px-6 py-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            <th className="text-left py-1.5 pr-4">Bride</th>
                            <th className="text-left py-1.5 pr-4">Stage</th>
                            <th className="text-left py-1.5 pr-4">Store</th>
                            <th className="text-left py-1.5 pr-4">Wedding</th>
                            <th className="text-right py-1.5 pr-4">Qty</th>
                            <th className="text-left py-1.5">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.lines.map((l) => (
                            <tr key={l.id} className="border-t border-border/40">
                              <td className="py-1.5 pr-4 font-medium">{l.bride_name}</td>
                              <td className="py-1.5 pr-4 text-muted-foreground">
                                {prettyStage(l.current_stage)}
                              </td>
                              <td className="py-1.5 pr-4 text-muted-foreground">
                                {l.store || "—"}
                              </td>
                              <td className="py-1.5 pr-4 text-muted-foreground">
                                {l.wedding_date ? formatDate(l.wedding_date) : "—"}
                              </td>
                              <td className="py-1.5 pr-4 text-right font-serif">
                                {formatQuantity(l.quantity, g.stock_unit)}
                              </td>
                              <td className="py-1.5 text-muted-foreground">
                                {l.note || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
