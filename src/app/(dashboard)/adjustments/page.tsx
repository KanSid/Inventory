import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import { formatDate, formatLength } from "@/lib/utils";

export default async function AdjustmentsPage() {
  const supabase = await createClient();

  const { data: adjustments } = await supabase
    .from("stock_adjustments")
    .select("*, rolls(roll_number, products(item_code)), profiles:adjusted_by(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        description="Manual corrections and damage records"
        action={
          canEdit ? (
            <Link href="/adjustments/new">
              <Button>
                <Plus size={16} className="mr-2" />
                New Adjustment
              </Button>
            </Link>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Roll</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!adjustments || adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No adjustments yet.
                  </TableCell>
                </TableRow>
              ) : (
                adjustments.map((a) => {
                  const roll = a.rolls as { roll_number: string; products: { item_code: string } } | null;
                  const adjBy = a.profiles as { full_name: string } | null;
                  const typeColors: Record<string, string> = {
                    addition: "bg-emerald-100 text-emerald-700",
                    deduction: "bg-red-100 text-red-700",
                    damage: "bg-red-100 text-red-700",
                    correction: "bg-amber-100 text-amber-700",
                  };
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{formatDate(a.created_at)}</TableCell>
                      <TableCell className="font-medium">
                        {roll?.products?.item_code} / {roll?.roll_number}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[a.adjustment_type] ?? ""}`}>
                          {a.adjustment_type.charAt(0).toUpperCase() + a.adjustment_type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {a.adjustment_type === "addition" || a.adjustment_type === "correction" ? "+" : "−"}
                        {formatLength(a.quantity)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">{a.reason}</TableCell>
                      <TableCell className="text-muted-foreground">{adjBy?.full_name ?? "—"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
