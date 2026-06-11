import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { ReceiveShipmentButton } from "@/components/shipments/receive-button";
import { formatDate, formatQuantity } from "@/lib/utils";

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: shipment } = await supabase
    .from("shipments")
    .select("*")
    .eq("id", id)
    .single();

  if (!shipment) notFound();

  const { data: items } = await supabase
    .from("shipment_items")
    .select("*, products(item_code, description, categories(unit)), suppliers(name)")
    .eq("shipment_id", id);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const canEdit = profile?.role === "admin" || profile?.role === "inventory_manager";

  const isReceived = shipment.status === "received";

  const discrepancyCount = isReceived ? (items ?? []).filter((item) => {
    if (item.received_quantity_in_meters == null) return false;
    const product = item.products as { categories: { unit: string } | null } | null;
    const stockUnit = product?.categories?.unit ?? "roll";
    if (stockUnit === "pieces") {
      return Math.round(item.received_quantity_in_meters) !== Math.round(item.quantity_in_meters);
    }
    return (
      item.received_num_rolls !== item.num_rolls ||
      round1(item.received_quantity_in_meters) !== round1(item.quantity_in_meters)
    );
  }).length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={shipment.shipment_number}
        description="Shipment details and items"
        action={
          canEdit && shipment.status === "pending" ? (
            <ReceiveShipmentButton shipmentId={id} />
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <span className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              shipment.status === "received" ? "bg-emerald-100 text-emerald-700" :
              shipment.status === "pending" ? "bg-amber-100 text-amber-700" :
              "bg-muted text-muted-foreground"
            }`}>
              {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{shipment.date ? formatDate(shipment.date) : "—"}</p>
          </CardContent>
        </Card>
        {isReceived && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Discrepancies</p>
              <p className={`font-medium ${discrepancyCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                {discrepancyCount === 0 ? "None — fully matched" : `${discrepancyCount} item${discrepancyCount > 1 ? "s" : ""}`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {isReceived && shipment.received_notes && (
        <Card>
          <CardContent className="pt-6">
            <p className="mb-1 text-sm font-medium text-muted-foreground">Discrepancy notes</p>
            <p className="text-sm">{shipment.received_notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isReceived ? "Items — expected vs received" : "Items"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isReceived ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Exp. total</TableHead>
                  <TableHead className="text-right">Rec. total</TableHead>
                  <TableHead className="text-right">Exp. rolls</TableHead>
                  <TableHead className="text-right">Rec. rolls</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!items || items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No items.</TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const product = item.products as { item_code: string; description: string; categories: { unit: string } | null } | null;
                    const supplier = item.suppliers as { name: string } | null;
                    const stockUnit = (product?.categories?.unit ?? "roll") as "roll" | "pieces";

                    const hasReceivedData = item.received_quantity_in_meters != null;

                    const qtyMismatch = hasReceivedData && stockUnit === "pieces" &&
                      Math.round(item.received_quantity_in_meters) !== Math.round(item.quantity_in_meters);

                    const totalMismatch = hasReceivedData && stockUnit === "roll" &&
                      round1(item.received_quantity_in_meters) !== round1(item.quantity_in_meters);

                    const rollMismatch = hasReceivedData && stockUnit === "roll" &&
                      item.received_num_rolls !== item.num_rolls;

                    const hasDisc = qtyMismatch || totalMismatch || rollMismatch;

                    return (
                      <TableRow key={item.id} className={hasDisc ? "bg-amber-50/40" : undefined}>
                        <TableCell className="font-medium">
                          {product?.item_code}
                          <span className="ml-1.5 font-normal text-muted-foreground">— {product?.description}</span>
                        </TableCell>
                        <TableCell>{supplier?.name ?? "—"}</TableCell>

                        {/* Expected total */}
                        <TableCell className="text-right text-muted-foreground">
                          {formatQuantity(item.quantity_in_meters, stockUnit)}
                        </TableCell>

                        {/* Received total */}
                        <TableCell className={`text-right font-medium ${(qtyMismatch || totalMismatch) ? "text-amber-600" : "text-emerald-700"}`}>
                          {hasReceivedData
                            ? formatQuantity(item.received_quantity_in_meters, stockUnit)
                            : "—"}
                        </TableCell>

                        {/* Expected rolls */}
                        <TableCell className="text-right text-muted-foreground">
                          {stockUnit === "pieces" ? "—" : item.num_rolls}
                        </TableCell>

                        {/* Received rolls */}
                        <TableCell className={`text-right font-medium ${rollMismatch ? "text-amber-600" : stockUnit === "pieces" ? "text-muted-foreground" : "text-emerald-700"}`}>
                          {stockUnit === "pieces" ? "—" : (hasReceivedData ? (item.received_num_rolls ?? "—") : "—")}
                        </TableCell>

                        <TableCell>
                          {!hasReceivedData ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : hasDisc ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Discrepancy
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Matched
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">In Meters</TableHead>
                  <TableHead className="text-right">Rolls</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!items || items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No items.</TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const product = item.products as { item_code: string; description: string; categories: { unit: string } | null } | null;
                    const supplier = item.suppliers as { name: string } | null;
                    const stockUnit = (product?.categories?.unit ?? "roll") as "roll" | "pieces";
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{product?.item_code} — {product?.description}</TableCell>
                        <TableCell>{supplier?.name ?? "—"}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>{item.input_unit}</TableCell>
                        <TableCell className="text-right">{formatQuantity(item.quantity_in_meters, stockUnit)}</TableCell>
                        <TableCell className="text-right">{stockUnit === "pieces" ? "—" : item.num_rolls}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
