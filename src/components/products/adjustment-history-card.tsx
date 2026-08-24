"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { formatQuantity, formatDate, getRecentMonthOptions } from "@/lib/utils";
import { getProductAdjustmentsPage } from "@/actions/adjustment";

const PAGE_SIZE = 50;
const MONTH_OPTIONS = getRecentMonthOptions();

type AdjustmentRow = {
  id: string;
  created_at: string;
  adjustment_type: string;
  quantity: number;
  reason: string;
  rolls?: { roll_number: string } | null;
  piece_batches?: { batch_number: string } | null;
  profiles: { full_name: string } | null;
};

const TYPE_CONFIG: Record<string, { label: string; badge: string }> = {
  addition: { label: "Addition", badge: "bg-emerald-100 text-emerald-700" },
  deduction: { label: "Deduction", badge: "bg-red-100 text-red-700" },
  damage: { label: "Damage", badge: "bg-red-100 text-red-700" },
  correction: { label: "Correction", badge: "bg-amber-100 text-amber-700" },
};

const POSITIVE_TYPES = new Set(["addition", "correction"]);

function monthRange(month: string): { from: string; to: string } {
  const [year, mon] = month.split("-").map(Number);
  const from = `${month}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const to = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export function AdjustmentHistoryCard({
  productId,
  isRoll,
  stockUnit,
  initialAdjustments,
  initialCount,
}: {
  productId: string;
  isRoll: boolean;
  stockUnit: "roll" | "pieces";
  initialAdjustments: AdjustmentRow[];
  initialCount: number;
}) {
  const [adjustments, setAdjustments] = useState<AdjustmentRow[]>(initialAdjustments);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const totalQuantity = useMemo(
    () =>
      adjustments.reduce(
        (sum, a) => sum + (POSITIVE_TYPES.has(a.adjustment_type) ? Number(a.quantity) : -Number(a.quantity)),
        0,
      ),
    [adjustments],
  );

  const [month, setMonth] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const hasMore = adjustments.length < count;

  async function fetchPage(offset: number, filters: { month: string; from: string; to: string }) {
    const range = filters.month ? monthRange(filters.month) : { from: filters.from || null, to: filters.to || null };
    return getProductAdjustmentsPage({
      productId,
      isRoll,
      offset,
      limit: PAGE_SIZE,
      dateFrom: range.from,
      dateTo: range.to,
    });
  }

  async function handleShowMore() {
    setLoading(true);
    const result = await fetchPage(adjustments.length, { month, from, to });
    setAdjustments((prev) => [...prev, ...(result.data as AdjustmentRow[])]);
    setCount(result.count);
    setLoading(false);
  }

  async function applyFilters(filters: { month: string; from: string; to: string }) {
    setLoading(true);
    const result = await fetchPage(0, filters);
    setAdjustments(result.data as AdjustmentRow[]);
    setCount(result.count);
    setLoading(false);
  }

  function handleMonthChange(value: string) {
    setMonth(value);
    setFrom("");
    setTo("");
    applyFilters({ month: value, from: "", to: "" });
  }

  function handleApplyRange() {
    setMonth("");
    applyFilters({ month: "", from, to });
  }

  function handleReset() {
    setMonth("");
    setFrom("");
    setTo("");
    applyFilters({ month: "", from: "", to: "" });
  }

  const hasActiveFilter = month !== "" || from !== "" || to !== "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Adjustment History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-end gap-3 border-b px-4 py-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Month</label>
            <select
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              disabled={loading}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm focus:border-ring focus:outline-none"
            >
              <option value="">All months</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">From Date</label>
            <DatePicker value={from} onChange={setFrom} disabled={loading} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">To Date</label>
            <DatePicker value={to} onChange={setTo} disabled={loading} />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={loading} onClick={handleApplyRange}>
              Filter
            </Button>
            {hasActiveFilter && (
              <Button type="button" size="sm" variant="outline" disabled={loading} onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>{isRoll ? "Roll" : "Batch"}</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {hasActiveFilter ? "No adjustments found for this filter." : "No adjustments recorded yet."}
                </TableCell>
              </TableRow>
            ) : (
              adjustments.map((a) => {
                const entryNum = isRoll ? a.rolls?.roll_number : a.piece_batches?.batch_number;
                const cfg = TYPE_CONFIG[a.adjustment_type] ?? { label: a.adjustment_type, badge: "bg-muted text-muted-foreground" };
                const isPositive = a.adjustment_type === "addition" || a.adjustment_type === "correction";

                return (
                  <TableRow key={a.id}>
                    <TableCell>{formatDate(a.created_at)}</TableCell>
                    <TableCell>{entryNum ?? "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${isPositive ? "text-emerald-700" : "text-red-600"}`}>
                      {isPositive ? "+" : "−"}{formatQuantity(a.quantity, stockUnit)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground text-sm">{a.reason}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.profiles?.full_name ?? "—"}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right">Total Adjustment</TableCell>
              <TableCell className={`text-right ${totalQuantity < 0 ? "text-red-600" : "text-emerald-700"}`}>
                {totalQuantity < 0 ? "−" : "+"}{formatQuantity(Math.abs(totalQuantity), stockUnit)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableFooter>
        </Table>
        {hasMore && (
          <div className="flex justify-center border-t py-3">
            <Button variant="ghost" size="sm" onClick={handleShowMore} disabled={loading}>
              {loading ? "Loading..." : "Show more"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
