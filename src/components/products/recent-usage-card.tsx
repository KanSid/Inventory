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
import { getProductUsagePage } from "@/actions/usage";

const PAGE_SIZE = 50;
const MONTH_OPTIONS = getRecentMonthOptions();

type UsageRow = {
  id: string;
  usage_date: string;
  quantity_used: number;
  brides: { name: string } | null;
  rolls?: { roll_number: string } | null;
  piece_batches?: { batch_number: string } | null;
};

function monthRange(month: string): { from: string; to: string } {
  const [year, mon] = month.split("-").map(Number);
  const from = `${month}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const to = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export function RecentUsageCard({
  productId,
  isRoll,
  stockUnit,
  initialUsage,
  initialCount,
}: {
  productId: string;
  isRoll: boolean;
  stockUnit: "roll" | "pieces";
  initialUsage: UsageRow[];
  initialCount: number;
}) {
  const [usage, setUsage] = useState<UsageRow[]>(initialUsage);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const totalQuantity = useMemo(
    () => usage.reduce((sum, u) => sum + Number(u.quantity_used), 0),
    [usage],
  );

  const [month, setMonth] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const hasMore = usage.length < count;

  async function fetchPage(offset: number, filters: { month: string; from: string; to: string }) {
    const range = filters.month ? monthRange(filters.month) : { from: filters.from || null, to: filters.to || null };
    return getProductUsagePage({
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
    const result = await fetchPage(usage.length, { month, from, to });
    setUsage((prev) => {
      const seen = new Set(prev.map((u) => u.id));
      return [...prev, ...(result.data as UsageRow[]).filter((u) => !seen.has(u.id))];
    });
    setCount(result.count);
    setLoading(false);
  }

  async function applyFilters(filters: { month: string; from: string; to: string }) {
    setLoading(true);
    const result = await fetchPage(0, filters);
    setUsage(result.data as UsageRow[]);
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
        <CardTitle className="text-lg">Recent Usage</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-end gap-3 border-b px-4 py-3">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Month</label>
            <select
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              disabled={loading}
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm focus:border-ring focus:outline-none"
            >
              <option value="">All months</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">From Date</label>
            <DatePicker value={from} onChange={setFrom} disabled={loading} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">To Date</label>
            <DatePicker value={to} onChange={setTo} disabled={loading} />
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              size="sm" 
              disabled={loading} 
              onClick={handleApplyRange}
              className="h-8" 
            >
              Filter
            </Button>
            {hasActiveFilter && (
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                disabled={loading} 
                onClick={handleReset}
                className="h-8"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      
  

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Bride</TableHead>
              <TableHead>{isRoll ? "Roll" : "Batch"}</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usage.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  {hasActiveFilter ? "No usage found for this filter." : "No usage recorded yet."}
                </TableCell>
              </TableRow>
            ) : (
              usage.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{formatDate(u.usage_date)}</TableCell>
                  <TableCell>{u.brides?.name ?? "—"}</TableCell>
                  <TableCell>
                    {isRoll ? u.rolls?.roll_number ?? "—" : u.piece_batches?.batch_number ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatQuantity(u.quantity_used, stockUnit)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right">Total Usage</TableCell>
              <TableCell className="text-right">{formatQuantity(totalQuantity, stockUnit)}</TableCell>
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
