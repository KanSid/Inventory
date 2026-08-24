"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { useRef } from "react";
import { createShipment, createAndReceiveShipment, updateShipment } from "@/actions/shipment";

interface LineItem {
  supplier_id: string;
  product_id: string;
  quantity: string;
  input_unit: "meters" | "yards" | "pieces";
  num_rolls: string;
  roll_lengths: string[];
  notes: string;
}

interface Props {
  suppliers: { id: string; name: string }[];
  products: { id: string; item_code: string; description: string; category_unit: string }[];
  mode?: "create" | "edit";
  shipmentId?: string;
  initial?: {
    shipment_number: string;
    date: string;
    notes: string;
    items: LineItem[];
  };
}

export function ShipmentForm({ suppliers, products, mode = "create", shipmentId, initial }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [shipmentNumber, setShipmentNumber] = useState(initial?.shipment_number ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<LineItem[]>(
    initial?.items ?? [
      { supplier_id: "", product_id: "", quantity: "", input_unit: "meters", num_rolls: "1", roll_lengths: [""], notes: "" },
    ]
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitMode = useRef<"create" | "receive">("create");

  function addItem() {
    setItems([...items, { supplier_id: "", product_id: "", quantity: "", input_unit: "meters", num_rolls: "1", roll_lengths: [""], notes: "" }]);
  }

  function removeItem(idx: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof LineItem, value: string) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === "product_id") {
      const product = products.find((p) => p.id === value);
      if (product?.category_unit === "pieces") {
        updated[idx].input_unit = "pieces";
        updated[idx].num_rolls = "1";
        updated[idx].roll_lengths = [];
      } else {
        updated[idx].input_unit = "meters";
        const n = parseInt(updated[idx].num_rolls) || 1;
        updated[idx].roll_lengths = Array.from({ length: n }, (_, i) => updated[idx].roll_lengths[i] ?? "");
      }
    }
    if (field === "num_rolls" && updated[idx].input_unit !== "pieces") {
      const n = Math.max(1, Math.min(100, parseInt(value) || 1));
      const cur = updated[idx].roll_lengths;
      updated[idx].roll_lengths = Array.from({ length: n }, (_, i) => cur[i] ?? "");
    }
    setItems(updated);
  }

  function updateRollLength(itemIdx: number, rollIdx: number, value: string) {
    const updated = [...items];
    const lengths = [...updated[itemIdx].roll_lengths];
    lengths[rollIdx] = value;
    updated[itemIdx] = { ...updated[itemIdx], roll_lengths: lengths };
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      shipment_number: shipmentNumber,
      date: date || null,
      notes: notes || null,
      items: items.map((item) => {
        const numRolls = parseInt(item.num_rolls) || 1;
        const isMultiRoll = item.input_unit !== "pieces" && numRolls > 1;
        const rollLengthsNum = isMultiRoll ? item.roll_lengths.map(Number) : null;
        const quantity = isMultiRoll
          ? rollLengthsNum!.reduce((a, b) => a + b, 0)
          : Number(item.quantity);
        return {
          supplier_id: item.supplier_id || null,
          product_id: item.product_id,
          quantity,
          input_unit: item.input_unit,
          num_rolls: numRolls,
          roll_lengths: rollLengthsNum,
          notes: item.notes || null,
        };
      }),
    };

    const result = isEdit
      ? await updateShipment(shipmentId!, payload)
      : submitMode.current === "receive"
        ? await createAndReceiveShipment(payload)
        : await createShipment(payload);

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
      <CardHeader><CardTitle>{isEdit ? "Edit Shipment" : "Create Shipment"}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shipment_number">Shipment No.</Label>
              <Input
                id="shipment_number"
                value={shipmentNumber}
                onChange={(e) => setShipmentNumber(e.target.value)}
                placeholder="e.g. SH-2024-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Arrival Date (optional)</Label>
              <DatePicker value={date} onChange={setDate} />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Items</Label>

            {items.map((item, idx) => (
              <div key={idx} className="relative grid gap-5 rounded-lg border p-5 sm:grid-cols-6">
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-red-500 h-7 w-7"
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 size={14} />
                  </Button>
                )}

                {/* Supplier */}
                <div>
                  <Label className="text-xs mb-1.5 block pl-2">Supplier</Label>
                  <SearchableSelect
                    options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                    value={item.supplier_id}
                    onValueChange={(v) => updateItem(idx, "supplier_id", v)}
                    placeholder="Select..."
                  />
                </div>

                {/* Product */}
                <div className="sm:col-span-2">
                  <Label className="text-xs mb-1.5 block pl-2">Product</Label>
                  <SearchableSelect
                    options={products.map((p) => ({ value: p.id, label: p.item_code }))}
                    value={item.product_id}
                    onValueChange={(v) => updateItem(idx, "product_id", v)}
                    placeholder="Select..."
                    noneLabel={null}
                  />
                </div>

                {/* Quantity — single field for pieces or single roll */}
                {(item.input_unit === "pieces" || parseInt(item.num_rolls) <= 1) && (
                  <div>
                    <Label className="text-xs mb-1.5 block pl-2">
                      {item.input_unit === "pieces" ? "Qty (pcs)" : "Quantity"}
                    </Label>
                    <Input
                      type="number"
                      step={item.input_unit === "pieces" ? "1" : "0.01"}
                      min={item.input_unit === "pieces" ? "1" : "0.01"}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Per-roll lengths — shown when num_rolls > 1 */}
                {item.input_unit !== "pieces" && parseInt(item.num_rolls) > 1 && (
                  <div className="sm:col-span-6 space-y-1.5">
                    <div className="grid grid-cols-[1fr_120px] items-center gap-3 pb-0.5">
                      <p className="text-xs text-muted-foreground">Roll</p>
                      <p className="text-right text-xs text-muted-foreground">
                        Length ({item.input_unit === "yards" ? "yds" : "m"})
                      </p>
                    </div>
                    {item.roll_lengths.map((len, rIdx) => (
                      <div key={rIdx} className="grid grid-cols-[1fr_120px] items-center gap-3">
                        <p className="text-sm text-muted-foreground">Roll {rIdx + 1}</p>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={len}
                          onChange={(e) => updateRollLength(idx, rIdx, e.target.value)}
                          required
                          className="h-8 text-right text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Unit — hidden for pieces */}
                {item.input_unit !== "pieces" && (
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

                {/* Rolls — hidden for pieces (always 1) */}
                {item.input_unit !== "pieces" && (
                  <div>
                    <Label className="text-xs mb-1.5 block pl-2">Rolls</Label>
                    <Input type="number" min="1" max="100" value={item.num_rolls} onChange={(e) => updateItem(idx, "num_rolls", e.target.value)} required />
                  </div>
                )}
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" className="w-full" onClick={addItem}>
              <Plus size={14} className="mr-1.5" /> Add Item
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            {isEdit ? (
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={loading}
                  onClick={() => { submitMode.current = "create"; }}
                >
                  {loading && submitMode.current === "create" ? "Creating..." : "Create Shipment"}
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                  onClick={() => { submitMode.current = "receive"; }}
                >
                  {loading && submitMode.current === "receive" ? "Receiving..." : "Create & Receive"}
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
