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
    .select("*")
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
              <Button>
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
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!shipments || shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    No shipments yet. Create one to start tracking incoming stock.
                  </TableCell>
                </TableRow>
              ) : (
                shipments.map((s) => {
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Link href={`/shipments/${s.id}`} className="font-serif text-primary hover:underline">
                          {s.shipment_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.status === "received" ? "bg-emerald-100 text-emerald-700" :
                          s.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{s.date ? formatDate(s.date) : "—"}</TableCell>
                      <TableCell className="max-w-[240px] truncate text-muted-foreground" title={s.notes ?? undefined}>
                        {s.notes ?? "—"}
                      </TableCell>
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
