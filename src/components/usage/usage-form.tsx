"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { logUsageBatch } from "@/actions/usage";
import { createBride } from "@/actions/bride";
import { createClient } from "@/lib/supabase/client";
import { formatQuantity } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

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
  number: string;
  qty: number;
}

interface LineItem {
  key: string;
  productId: string;
  entryId: string;
  quantity: string;
  entries: StockEntry[];
  loadingEntries: boolean;
}

function mkItem(): LineItem {
  return { key: Math.random().toString(36).slice(2), productId: "", entryId: "", quantity: "", entries: [], loadingEntries: false };
}

export function UsageForm({ brides: initialBrides, products }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [brides, setBrides] = useState(initialBrides);
  const [brideId, setBrideId] = useState("");
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([mkItem()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [brideDialogOpen, setBrideDialogOpen] = useState(false);
  const [newBrideName, setNewBrideName] = useState("");
  const [newBridePhone, setNewBridePhone] = useState("");
  const [brideLoading, setBrideLoading] = useState(false);

  async function loadEntries(key: string, productId: string, isRoll: boolean) {
    setItems((prev) => prev.map((item) => item.key === key ? { ...item, entryId: "", entries: [], loadingEntries: true } : item));

    const table = isRoll ? "rolls" : "piece_batches";
    const numField = isRoll ? "roll_number" : "batch_number";
    const qtyField = isRoll ? "current_length_m" : "current_count";

    const { data } = await (supabase as any)
      .from(table)
      .select(`id, ${numField}, ${qtyField}, status`)
      .eq("product_id", productId)
      .eq("status", "active")
      .order(numField);

    const entries: StockEntry[] = (data ?? []).map((r: any) => ({
      id: r.id,
      number: r[numField],
      qty: r[qtyField],
    }));

    setItems((prev) => prev.map((item) => item.key === key ? { ...item, entries, loadingEntries: false } : item));
  }

  function updateItem(key: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item) => item.key === key ? { ...item, ...patch } : item));
  }

  function handleProductChange(key: string, productId: string) {
    const product = products.find((p) => p.id === productId);
    const isRoll = (product?.categories?.unit ?? "roll") === "roll";
    updateItem(key, { productId, entryId: "", entries: [] });
    if (productId) loadEntries(key, productId, isRoll);
  }

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
    const newErrors: Record<string, string> = {};

    if (!brideId) newErrors.bride_id = "Select a bride";
    items.forEach((item, i) => {
      if (!item.productId) newErrors[`item_${i}_product`] = "Select a product";
      if (!item.entryId) newErrors[`item_${i}_entry`] = "Select a roll/batch";
      if (!item.quantity || Number(item.quantity) <= 0) newErrors[`item_${i}_qty`] = "Enter a quantity";
    });

    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});
    setLoading(true);

    const payload = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const isRoll = (product?.categories?.unit ?? "roll") === "roll";
      return {
        roll_id: isRoll ? item.entryId : null,
        batch_id: !isRoll ? item.entryId : null,
        quantity_used: Number(item.quantity),
      };
    });

    const result = await logUsageBatch({ bride_id: brideId, usage_date: usageDate, notes: notes || null, items: payload });

    if ("error" in result) {
      const err = result.error as any;
      if (typeof err === "object" && !Array.isArray(err)) {
        const flat: Record<string, string> = {};
        Object.entries(err).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? (v as string[])[0] : String(v); });
        setErrors(flat);
      }
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shared: Bride + Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Bride</Label>
                  <Button type="button" variant="link" className="h-auto p-0 text-xs text-primary" onClick={() => setBrideDialogOpen(true)}>
                    + Quick add
                  </Button>
                </div>
                <SearchableSelect
                  options={brides.map((b) => ({ value: b.id, label: b.name }))}
                  value={brideId}
                  onValueChange={setBrideId}
                  placeholder="Select bride"
                  noneLabel={null}
                />
                {errors.bride_id && <p className="text-xs text-red-500">{errors.bride_id}</p>}
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker value={usageDate} onChange={setUsageDate} />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <Label>Products Used</Label>
              <div className="space-y-2">
                {items.map((item, i) => {
                  const product = products.find((p) => p.id === item.productId);
                  const isRoll = (product?.categories?.unit ?? "roll") === "roll";
                  const stockUnit = (isRoll ? "roll" : "pieces") as "roll" | "pieces";
                  const selectedEntry = item.entries.find((e) => e.id === item.entryId);

                  return (
                    <div key={item.key} className="relative rounded-lg border p-3">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setItems((prev) => prev.filter((x) => x.key !== item.key))}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <div className="grid gap-3 sm:grid-cols-3 pr-6">
                        {/* Product */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Product</Label>
                          <SearchableSelect
                            options={products.map((p) => ({ value: p.id, label: p.item_code }))}
                            value={item.productId}
                            onValueChange={(v) => handleProductChange(item.key, v)}
                            placeholder="Select product"
                            noneLabel={null}
                          />
                          {errors[`item_${i}_product`] && <p className="text-xs text-red-500">{errors[`item_${i}_product`]}</p>}
                        </div>

                        {/* Roll / Batch */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{isRoll ? "Roll" : "Batch"}</Label>
                          <SearchableSelect
                            options={item.entries.map((e) => ({ value: e.id, label: `${e.number} — ${formatQuantity(e.qty, stockUnit)} left` }))}
                            value={item.entryId}
                            onValueChange={(v) => updateItem(item.key, { entryId: v })}
                            placeholder={!item.productId ? "Select product first" : item.loadingEntries ? "Loading…" : `Select ${isRoll ? "roll" : "batch"}`}
                            noneLabel={null}
                            disabled={!item.productId || item.loadingEntries}
                          />
                          {errors[`item_${i}_entry`] && <p className="text-xs text-red-500">{errors[`item_${i}_entry`]}</p>}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">{isRoll ? "Qty (m)" : "Qty (pcs)"}</Label>
                          <Input
                            type="number"
                            step={isRoll ? "0.01" : "1"}
                            min={isRoll ? "0.01" : "1"}
                            max={selectedEntry?.qty}
                            value={item.quantity}
                            onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
                            placeholder="0"
                          />
                          {selectedEntry && (
                            <p className="text-xs text-muted-foreground">Max: {formatQuantity(selectedEntry.qty, stockUnit)}</p>
                          )}
                          {errors[`item_${i}_qty`] && <p className="text-xs text-red-500">{errors[`item_${i}_qty`]}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setItems((prev) => [...prev, mkItem()])}>
                <Plus size={14} className="mr-1.5" /> Add Another Product
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Logging…" : items.length > 1 ? `Log ${items.length} Items` : "Log Usage"}
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
              <Button type="submit" disabled={brideLoading}>{brideLoading ? "Adding…" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
