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
  products: { id: string; item_code: string; description: string; stock_unit: string }[];
}

interface LineItem {
  supplier_id: string;
  product_id: string;
  quantity: string;
  input_unit: "meters" | "yards" | "pairs";
  num_rolls: string;
  notes: string;
}

export function ShipmentForm({ suppliers, products }: Props) {
  const router = useRouter();
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { supplier_id: "", product_id: "", quantity: "", input_unit: "meters", num_rolls: "1", notes: "" },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addItem() {
    setItems([...items, { supplier_id: "", product_id: "", quantity: "", input_unit: "meters", num_rolls: "1", notes: "" }]);
  }

  function removeItem(idx: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof LineItem, value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    // When product changes, auto-set input_unit to match stock_unit
    if (field === "product_id") {
      const product = products.find((p) => p.id === value);
      if (product?.stock_unit === "pair") {
        updated[idx].input_unit = "pairs";
        updated[idx].num_rolls = "1";
      } else {
        updated[idx].input_unit = "meters";
      }
    }
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createShipment({
      supplier_id: null,
      expected_date: expectedDate || null,
      notes: notes || null,
      items: items.map((item) => ({
        supplier_id: item.supplier_id || null,
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
          <div className="grid gap-4 sm:grid-cols-1">
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
              <div key={idx} className="grid gap-5 rounded-lg border p-5 sm:grid-cols-6">
                {/* Supplier */}
                <div>
                  <Label className="text-xs mb-1.5 block pl-2">Supplier</Label>
                  <Select value={item.supplier_id} onValueChange={(v) => updateItem(idx, "supplier_id", v ?? "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select">
                        {item.supplier_id ? suppliers.find(s => s.id === item.supplier_id)?.name : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product */}
                <div className="sm:col-span-2">
                  <Label className="text-xs mb-1.5 block pl-2">Product</Label>
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

                {/* Quantity */}
                <div>
                  <Label className="text-xs mb-1.5 block pl-2">
                    {item.input_unit === "pairs" ? "Qty (pairs)" : "Quantity"}
                  </Label>
                  <Input
                    type="number"
                    step={item.input_unit === "pairs" ? "1" : "0.5"}
                    min={item.input_unit === "pairs" ? "1" : "0.5"}
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    required
                  />
                </div>

                {/* Unit — hidden for pairs */}
                {item.input_unit !== "pairs" && (
                  <div>
                    <Label className="text-xs mb-1.5 block pl-2">Unit</Label>
                    <Select value={item.input_unit} onValueChange={(v) => updateItem(idx, "input_unit", v ?? "meters")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meters">Meters</SelectItem>
                        <SelectItem value="yards">Yards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Rolls / Batches & Remove Button */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs mb-1.5 block">
                      {item.input_unit === "pairs" ? "Batches" : "Rolls"}
                    </Label>
                    <Input type="number" min="1" max="100" value={item.num_rolls} onChange={(e) => updateItem(idx, "num_rolls", e.target.value)} required />
                  </div>
                  {items.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 flex-shrink-0" 
                      onClick={() => removeItem(idx)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            </div>
          <div className="space-y-2 mt-4">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Shipment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
