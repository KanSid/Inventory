import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ShipmentsPage() {
  const supabase = await createClient();

  const { data: shipments } = await supabase
    .from("shipments")
    .select("*, shipment_items(supplier_id, suppliers(name))")
    .order("created_at", { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipments"
        description="Incoming stock from suppliers"
        action={
          canEdit ? (
            <Link href="/shipments/new">
              <Button className="bg-rose-600 hover:bg-rose-700">
                <Plus size={16} className="mr-2" />
                New Shipment
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
                <TableHead>Shipment #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!shipments || shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No shipments yet.
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((s) => {
                  const items = s.shipment_items as any[] || [];
                  const uniqueSuppliers = new Set(
                    items
                      .filter((item) => item.suppliers?.name)
                      .map((item) => item.suppliers.name)
                  );
                  const supplierCount = uniqueSuppliers.size;
                  const supplierCountText = supplierCount === 1 ? "1 supplier" : `${supplierCount} suppliers`;

                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Link href={`/shipments/${s.id}`} className="font-medium text-rose-600 hover:underline">
                          {s.shipment_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {supplierCount > 0 ? supplierCountText : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.status === "received" ? "bg-emerald-100 text-emerald-700" :
                          s.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-neutral-100 text-neutral-500"
                        }`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{s.expected_date ? formatDate(s.expected_date) : "—"}</TableCell>
                      <TableCell>{s.received_date ? formatDate(s.received_date) : "—"}</TableCell>
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
