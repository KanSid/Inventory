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
import { getAllProductUsage } from "@/actions/usage";

type UsageRow = {
  id: string;
  usage_date: string;
  quantity_used: number;
  brides: { name: string } | null;
  rolls?: { roll_number: string } | null;
  piece_batches?: { batch_number: string } | null;
};

export function RecentUsageCard({
  productId,
  isRoll,
  stockUnit,
  initialUsage,
  hasMore,
  totalQuantity,
}: {
  productId: string;
  isRoll: boolean;
  stockUnit: "roll" | "pieces";
  initialUsage: UsageRow[];
  hasMore: boolean;
  totalQuantity: number;
}) {
  const [usage, setUsage] = useState<UsageRow[]>(initialUsage);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleShowMore() {
    setLoading(true);
    const all = await getAllProductUsage(productId, isRoll);
    setUsage(all as UsageRow[]);
    setExpanded(true);
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Usage</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
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
                  No usage recorded yet.
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
