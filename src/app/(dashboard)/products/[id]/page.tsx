import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pencil, Plus } from "lucide-react";
import { formatLength, formatDate } from "@/lib/utils";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: product },
    { data: rolls },
    { data: usage },
    { data: summary },
  ] = await Promise.all([
    supabase.from("products").select("*, categories(name, color)").eq("id", id).single(),
    supabase.from("rolls").select("*").eq("product_id", id).order("roll_number"),
    supabase
      .from("stock_usage")
      .select("*, brides(name), rolls(roll_number)")
      .eq("rolls.product_id", id)
      .order("usage_date", { ascending: false })
      .limit(20),
    supabase.from("product_stock_summary").select("*").eq("id", id).single(),
  ]);

  if (!product) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  const cat = product.categories as { name: string; color: string } | null;
  const stockStatus = (summary?.stock_status ?? "out_of_stock") as "in_stock" | "low_stock" | "out_of_stock" | "phased_out";

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.item_code}
        description={product.description}
        action={
          canEdit ? (
            <div className="flex gap-2">
              <Link href={`/products/${id}/rolls/add`}>
                <Button className="bg-rose-600 hover:bg-rose-700">
                  <Plus size={16} className="mr-2" />
                  Add Rolls
                </Button>
              </Link>
              <Link href={`/products/${id}/edit`}>
                <Button variant="outline">
                  <Pencil size={16} className="mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* Info Card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Category</p>
            {cat && (
              <span
                className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: cat.color + "20", color: cat.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Stock</p>
            <p className="text-2xl font-bold">{formatLength(summary?.total_stock_m ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Rolls</p>
            <p className="text-2xl font-bold">{summary?.active_roll_count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={stockStatus} />
            </div>
          </CardContent>
        </Card>
      </div>

      {product.sub_type && (
        <div className="flex gap-2">
          <Badge variant="secondary">{product.sub_type}</Badge>
        </div>
      )}

      {/* Rolls Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rolls ({rolls?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll #</TableHead>
                <TableHead className="text-right">Initial</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Full Roll</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!rolls || rolls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No rolls yet. Add rolls to start tracking stock.
                  </TableCell>
                </TableRow>
              ) : (
                rolls.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.roll_number}</TableCell>
                    <TableCell className="text-right">{formatLength(r.initial_length_m)}</TableCell>
                    <TableCell className="text-right font-medium">{formatLength(r.current_length_m)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {r.status === "active" ? "Active" : "Finished"}
                      </span>
                    </TableCell>
                    <TableCell>{r.is_full_roll ? "Yes" : "No"}</TableCell>
                    <TableCell>{formatDate(r.received_date)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Usage */}
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
                <TableHead>Roll</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!usage || usage.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No usage recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                usage.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{formatDate(u.usage_date)}</TableCell>
                    <TableCell>{(u.brides as { name: string } | null)?.name ?? "—"}</TableCell>
                    <TableCell>{(u.rolls as { roll_number: string } | null)?.roll_number ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatLength(u.quantity_used)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
