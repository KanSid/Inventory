import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: supplier } = await supabase.from("suppliers").select("*").eq("id", id).single();
  if (!supplier) notFound();

  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .eq("supplier_id", id)
    .order("created_at", { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.name}
        description={supplier.contact_person || undefined}

        action={
          isAdmin ? (
            <Link href={`/suppliers/${id}/edit`}>
              <Button variant="outline"><Pencil size={16} className="mr-2" />Edit</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{supplier.phone || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{supplier.email || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Shipments</p>
            <p className="text-2xl font-bold">{shipments?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Shipment History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!shipments || shipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No shipments.</TableCell>
                </TableRow>
              ) : (
                shipments.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link href={`/shipments/${s.id}`} className="font-medium text-rose-600 hover:underline">
                        {s.shipment_number}
                      </Link>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
