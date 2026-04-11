import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { ReceiveShipmentButton } from "@/components/shipments/receive-button";
import { formatDate, formatLength } from "@/lib/utils";

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: shipment } = await supabase
    .from("shipments")
    .select("*, suppliers(name)")
    .eq("id", id)
    .single();

  if (!shipment) notFound();

  const { data: items } = await supabase
    .from("shipment_items")
    .select("*, products(item_code, description)")
    .eq("shipment_id", id);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  const supplier = shipment.suppliers as { name: string } | null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={shipment.shipment_number}
        description={`From ${supplier?.name ?? "Unknown"}`}
        action={
          canEdit && shipment.status === "pending" ? (
            <ReceiveShipmentButton shipmentId={id} />
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              shipment.status === "received" ? "bg-emerald-100 text-emerald-700" :
              shipment.status === "pending" ? "bg-amber-100 text-amber-700" :
              "bg-neutral-100 text-neutral-500"
            }`}>
              {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Expected</p>
            <p className="font-medium">{shipment.expected_date ? formatDate(shipment.expected_date) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Received</p>
            <p className="font-medium">{shipment.received_date ? formatDate(shipment.received_date) : "—"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Items</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">In Meters</TableHead>
                <TableHead className="text-right">Rolls</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!items || items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No items.</TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const product = item.products as { item_code: string; description: string } | null;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{product?.item_code} — {product?.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>{item.input_unit}</TableCell>
                      <TableCell className="text-right">{formatLength(item.quantity_in_meters)}</TableCell>
                      <TableCell className="text-right">{item.num_rolls}</TableCell>
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
