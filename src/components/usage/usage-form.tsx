"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { logUsage } from "@/actions/usage";
import { createBride } from "@/actions/bride";
import { createClient } from "@/lib/supabase/client";
import { formatQuantity } from "@/lib/utils";

interface ProductRow {
  id: string;
  item_code: string;
  description: string;
  categories: { unit: string } | null;
}

interface Props {
  brides: { id: string; name: string }[];
  products: ProductRow[];
}

interface StockEntry {
  id: string;
  number: string; // roll_number or batch_number
  qty: number;    // current_length_m or current_count
  status: string;
}

export function UsageForm({ brides: initialBrides, products }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [brides, setBrides] = useState(initialBrides);
  const [brideId, setBrideId] = useState("");
  const [productId, setProductId] = useState("");
  const [entryId, setEntryId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const [brideDialogOpen, setBrideDialogOpen] = useState(false);
  const [newBrideName, setNewBrideName] = useState("");
  const [newBridePhone, setNewBridePhone] = useState("");
  const [brideLoading, setBrideLoading] = useState(false);

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
        .eq("status", "active")
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
        .eq("status", "active")
        .order("batch_number")
        .then(({ data }) => {
          setEntries((data ?? []).map((b) => ({ id: b.id, number: b.batch_number, qty: b.current_count, status: b.status })));
          setEntryId("");
        });
    }
  }, [productId, isRoll]);

  const selectedEntry = entries.find((e) => e.id === entryId);

  async function handleQuickAddBride(e: React.FormEvent) {
    e.preventDefault();
    setBrideLoading(true);
    const result = await createBride({ name: newBrideName, phone: newBridePhone || null });
    if ("bride" in result && result.bride) {
      setBrides((prev) => [...prev, result.bride!].sort((a, b) => a.name.localeCompare(b.name)));
      setBrideId(result.bride.id);
      setBrideDialogOpen(false);
      setNewBrideName("");
      setNewBridePhone("");
    }
    setBrideLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await logUsage({
      bride_id: brideId,
      roll_id: isRoll ? entryId : null,
      batch_id: !isRoll ? entryId : null,
      quantity_used: Number(quantity),
      usage_date: usageDate,
      notes: notes || null,
    });

    if ("error" in result) {
      setErrors(result.error as Record<string, string[]>);
      setLoading(false);
      return;
    }

    router.push("/usage");
  }

  return (
    <>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Log Material Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bride */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Bride</Label>
                <Button type="button" variant="link" className="h-auto p-0 text-xs text-primary" onClick={() => setBrideDialogOpen(true)}>
                  + Quick add
                </Button>
              </div>
              <Select value={brideId} onValueChange={(v) => setBrideId(v ?? "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select bride">
                    {brideId ? brides.find(b => b.id === brideId)?.name : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {brides.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bride_id && <p className="text-xs text-red-500">{errors.bride_id[0]}</p>}
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={productId} onValueChange={(v) => setProductId(v ?? "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select product">
                    {productId ? products.find(p => p.id === productId)?.item_code : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.item_code} — {p.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Roll / Batch */}
            <div className="space-y-2">
              <Label>{isRoll ? "Roll" : "Batch"}</Label>
              <Select value={entryId} onValueChange={(v) => setEntryId(v ?? "")} required disabled={!productId}>
                <SelectTrigger>
                  <SelectValue placeholder={productId ? `Select ${isRoll ? "roll" : "batch"}` : "Select a product first"}>
                    {entryId ? entries.find(e => e.id === entryId)?.number : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {entries.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.number} — {formatQuantity(e.qty, stockUnit)} remaining
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roll_id && <p className="text-xs text-red-500">{errors.roll_id[0]}</p>}
            </div>

            {/* Quantity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{isRoll ? "Quantity (meters)" : "Quantity (pieces)"}</Label>
                <Input
                  type="number"
                  step={isRoll ? "0.5" : "1"}
                  min={isRoll ? "0.5" : "1"}
                  max={selectedEntry?.qty}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder=" "
                  required
                />
                {selectedEntry && (
                  <p className="text-xs text-muted-foreground">
                    Max: {formatQuantity(selectedEntry.qty, stockUnit)}
                  </p>
                )}
                {errors.quantity_used && <p className="text-xs text-red-500">{errors.quantity_used[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={usageDate} onChange={(e) => setUsageDate(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Logging..." : "Log Usage"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={brideDialogOpen} onOpenChange={setBrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add Bride</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuickAddBride} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newBrideName} onChange={(e) => setNewBrideName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Phone (optional)</Label>
              <Input value={newBridePhone} onChange={(e) => setNewBridePhone(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setBrideDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={brideLoading}>
                {brideLoading ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
