"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdjustment } from "@/actions/adjustment";
import { createClient } from "@/lib/supabase/client";
import { formatLength } from "@/lib/utils";

interface Props {
  products: { id: string; item_code: string; description: string }[];
}

interface Roll {
  id: string;
  roll_number: string;
  current_length_m: number;
  status: string;
}

export function AdjustmentForm({ products }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [productId, setProductId] = useState("");
  const [rollId, setRollId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) { setRolls([]); setRollId(""); return; }
    supabase
      .from("rolls")
      .select("id, roll_number, current_length_m, status")
      .eq("product_id", productId)
      .order("roll_number")
      .then(({ data }) => {
        setRolls(data ?? []);
        setRollId("");
      });
  }, [productId, supabase]);

  const selectedRoll = rolls.find((r) => r.id === rollId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await createAdjustment({
      roll_id: rollId,
      adjustment_type: adjustmentType as "addition" | "deduction" | "damage" | "correction",
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
            <Select value={productId} onValueChange={(v) => setProductId(v ?? "")} required>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.item_code} — {p.description}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Roll</Label>
            <Select value={rollId} onValueChange={(v) => setRollId(v ?? "")} required disabled={!productId}>
              <SelectTrigger><SelectValue placeholder={productId ? "Select roll" : "Select product first"} /></SelectTrigger>
              <SelectContent>
                {rolls.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.roll_number} — {formatLength(r.current_length_m)} ({r.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roll_id && <p className="text-xs text-red-500">{errors.roll_id[0]}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v ?? "")} required>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="addition">Addition</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity (meters)</Label>
              <Input type="number" step="0.5" min="0.5" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              {selectedRoll && (
                <p className="text-xs text-muted-foreground">Current: {formatLength(selectedRoll.current_length_m)}</p>
              )}
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason (required)</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required />
          </div>

          {error(errors)}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={loading}>
              {loading ? "Saving..." : "Submit Adjustment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function error(errors: Record<string, string[]>) {
  const all = Object.values(errors).flat();
  if (all.length === 0) return null;
  return <p className="text-sm text-red-500">{all.join(", ")}</p>;
}
