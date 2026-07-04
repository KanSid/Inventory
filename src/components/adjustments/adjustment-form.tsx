"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdjustment } from "@/actions/adjustment";
import { createClient } from "@/lib/supabase/client";
import { formatQuantity } from "@/lib/utils";

interface ProductRow {
  id: string;
  item_code: string;
  description: string;
  categories: { unit: string } | null;
}

interface Props {
  products: ProductRow[];
}

interface StockEntry {
  id: string;
  number: string;
  qty: number;
  status: string;
}

export function AdjustmentForm({ products }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [productId, setProductId] = useState("");
  const [entryId, setEntryId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);
  const stockUnit = (selectedProduct?.categories?.unit ?? "roll") as "roll" | "pieces";
  const isRoll = stockUnit === "roll";

  useEffect(() => {
    if (!productId) { setEntries([]); setEntryId(""); return; }
    if (isRoll) {
      supabase
        .from("rolls")
        .select("id, roll_number, current_length_m, status")
        .eq("product_id", productId)
        .order("roll_number")
        .then(({ data }) => {
          setEntries((data ?? []).map((r) => ({ id: r.id, number: r.roll_number, qty: r.current_length_m, status: r.status })));
          setEntryId("");
        });
    } else {
      supabase
        .from("piece_batches")
        .select("id, batch_number, current_count, status")
        .eq("product_id", productId)
        .order("batch_number")
        .then(({ data }) => {
          setEntries((data ?? []).map((b) => ({ id: b.id, number: b.batch_number, qty: b.current_count, status: b.status })));
          setEntryId("");
        });
    }
  }, [productId, isRoll]);

  const selectedEntry = entries.find((e) => e.id === entryId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await createAdjustment({
      roll_id: isRoll ? entryId : null,
      batch_id: !isRoll ? entryId : null,
      adjustment_type: adjustmentType as "addition" | "deduction" | "damage",
      quantity: Number(quantity),
      reason,
    });

    if ("error" in result) {
      setErrors(result.error as Record<string, string[]>);
      setLoading(false);
      return;
    }

    router.push("/adjustments");
  }

  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle>Stock Adjustment</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <SearchableSelect
              options={products.map((p) => ({ value: p.id, label: p.item_code }))}
              value={productId}
              onValueChange={(v) => setProductId(v ?? "")}
              placeholder="Select product"
              noneLabel={null}
            />
          </div>

          <div className="space-y-2">
            <Label>{isRoll ? "Roll" : "Batch"}</Label>
            <SearchableSelect
              options={entries.map((e) => ({
                value: e.id,
                label: `${e.number} — ${formatQuantity(e.qty, stockUnit)} (${e.status})`,
              }))}
              value={entryId}
              onValueChange={(v) => setEntryId(v ?? "")}
              placeholder={productId ? `Select ${isRoll ? "roll" : "batch"}` : "Select product first"}
              noneLabel={null}
              disabled={!productId}
            />
            {errors.roll_id && <p className="text-xs text-red-500">{errors.roll_id[0]}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <SearchableSelect
                options={[
                  { value: "addition", label: "Addition" },
                  { value: "deduction", label: "Deduction" },
                  { value: "damage", label: "Damage" },
                ]}
                value={adjustmentType}
                onValueChange={(v) => setAdjustmentType(v ?? "")}
                placeholder="Select type"
                noneLabel={null}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRoll ? "Quantity (meters)" : "Quantity (pieces)"}</Label>
              <Input
                type="number"
                step={isRoll ? "0.5" : "1"}
                min={isRoll ? "0.5" : "1"}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              {selectedEntry && (
                <p className="text-xs text-muted-foreground">Current: {formatQuantity(selectedEntry.qty, stockUnit)}</p>
              )}
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason (required)</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required />
          </div>

          {Object.values(errors).flat().length > 0 && (
            <p className="text-sm text-red-500">{Object.values(errors).flat().join(", ")}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Submit Adjustment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
