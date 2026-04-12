"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { createShipment } from "@/actions/shipment";

interface Props {
  suppliers: { id: string; name: string }[];
  products: { id: string; item_code: string; description: string }[];
}

interface LineItem {
  product_id: string;
  quantity: string;
  input_unit: "meters" | "yards";
  num_rolls: string;
  notes: string;
}

export function ShipmentForm({ suppliers, products }: Props) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { product_id: "", quantity: "", input_unit: "meters", num_rolls: "1", notes: "" },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addItem() {
    setItems([...items, { product_id: "", quantity: "", input_unit: "meters", num_rolls: "1", notes: "" }]);
  }

  function removeItem(idx: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof LineItem, value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createShipment({
      supplier_id: supplierId,
      expected_date: expectedDate || null,
      notes: notes || null,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
        input_unit: item.input_unit,
        num_rolls: Number(item.num_rolls),
        notes: item.notes || null,
      })),
    });

    if ("error" in result) {
      const err = result.error;
      if (typeof err === "string") setError(err);
      else setError(Object.values(err as Record<string, string[]>).flat().join(", "));
      setLoading(false);
      return;
    }

    if ("id" in result) router.push(`/shipments/${result.id}`);
    else router.push("/shipments");
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader><CardTitle>Create Shipment</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={(v) => setSupplierId(v ?? "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier">
                    {supplierId ? suppliers.find(s => s.id === supplierId)?.name : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expected Date</Label>
              <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus size={14} className="mr-1" />Add Item
              </Button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Product</Label>
                  <Select value={item.product_id} onValueChange={(v) => updateItem(idx, "product_id", v ?? "")} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select">
                        {item.product_id ? products.find(p => p.id === item.product_id)?.item_code : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.item_code} — {p.description}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input type="number" step="0.5" min="0.5" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} required />
                </div>
                <div>
                  <Label className="text-xs">Unit</Label>
                  <Select value={item.input_unit} onValueChange={(v) => updateItem(idx, "input_unit", v ?? "meters")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meters">Meters</SelectItem>
                      <SelectItem value="yards">Yards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Rolls</Label>
                    <Input type="number" min="1" max="100" value={item.num_rolls} onChange={(e) => updateItem(idx, "num_rolls", e.target.value)} required />
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="mb-0 text-red-500" onClick={() => removeItem(idx)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={loading}>
              {loading ? "Creating..." : "Create Shipment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
