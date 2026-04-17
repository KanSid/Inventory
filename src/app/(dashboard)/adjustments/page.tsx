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

  const total = adjustments?.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-foreground">Stock Adjustments</h1>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">Manual corrections and damage records</p>
        </div>
        <div className="flex items-end gap-6">
          {/* Metric chip */}
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Total Logged</p>
            <p className="font-serif text-3xl text-foreground leading-none mt-0.5">{total}</p>
          </div>
          {canEdit && (
            <Link href="/adjustments/new">
              <Button>
                <Plus size={16} className="mr-2" />
                New Adjustment
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Material / Roll</TableHead>
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

                  const typeConfig: Record<string, { label: string; dot: string; badge: string }> = {
                    addition:   { label: "Addition",   dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
                    deduction:  { label: "Deduction",  dot: "bg-red-400",     badge: "bg-red-100 text-red-700" },
                    damage:     { label: "Damage",     dot: "bg-red-400",     badge: "bg-red-100 text-red-700" },
                    correction: { label: "Correction", dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-700" },
                  };
                  const cfg = typeConfig[a.adjustment_type] ?? { label: a.adjustment_type, dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground" };
                  const isPositive = a.adjustment_type === "addition" || a.adjustment_type === "correction";

                  return (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(a.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                          <span className="font-serif">
                            {roll?.products?.item_code}
                            {roll?.roll_number && (
                              <span className="text-muted-foreground font-sans text-xs ml-1">/ {roll.roll_number}</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-serif">
                        <span className={isPositive ? "text-emerald-700" : "text-red-600"}>
                          {isPositive ? "+" : "−"}{formatLength(a.quantity)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground text-sm">{a.reason}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{adjBy?.full_name ?? "—"}</TableCell>
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
