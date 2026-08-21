"use client";

import { useState } from "react";
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
import { formatQuantity, formatDate } from "@/lib/utils";
import { getAllProductAdjustments } from "@/actions/adjustment";

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

export function AdjustmentHistoryCard({
  productId,
  isRoll,
  stockUnit,
  initialAdjustments,
  hasMore,
  totalQuantity,
}: {
  productId: string;
  isRoll: boolean;
  stockUnit: "roll" | "pieces";
  initialAdjustments: AdjustmentRow[];
  hasMore: boolean;
  totalQuantity: number;
}) {
  const [adjustments, setAdjustments] = useState<AdjustmentRow[]>(initialAdjustments);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleShowMore() {
    setLoading(true);
    const all = await getAllProductAdjustments(productId, isRoll);
    setAdjustments(all as AdjustmentRow[]);
    setExpanded(true);
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Adjustment History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
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
                  No adjustments recorded yet.
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
        {!expanded && hasMore && (
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
