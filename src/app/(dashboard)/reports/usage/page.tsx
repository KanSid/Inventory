import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";
import { UsageReportClient } from "./client";

export default async function UsageReportPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canExport = profile?.role === "admin" || profile?.role === "inventory_manager";

  if (!canExport) notFound();

  const { data: usage } = await supabase
    .from("stock_usage")
    .select("*, products(item_code), brides(name), profiles:logged_by(full_name)")
    .order("usage_date", { ascending: false })
    .limit(500);

  const usageData = (usage ?? []).map((item: any) => ({
    usage_date: item.usage_date,
    item_code: item.products?.item_code || "Unknown",
    bride_name: item.brides?.name || "—",
    quantity_used: item.quantity_used || 0,
    logged_by: item.profiles?.full_name || "Unknown",
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Usage Report" description="Material consumption log" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Usage Records</CardTitle>
          <UsageReportClient data={usageData} />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Bride</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Logged By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No usage records
                    </TableCell>
                  </TableRow>
                ) : (
                  usageData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm">{formatDate(item.usage_date)}</TableCell>
                      <TableCell className="font-medium">{item.item_code}</TableCell>
                      <TableCell>{item.bride_name}</TableCell>
                      <TableCell className="text-right">{item.quantity_used}m</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.logged_by}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
