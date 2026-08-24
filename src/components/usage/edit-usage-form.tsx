"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { updateUsage } from "@/actions/usage";
import { formatQuantity } from "@/lib/utils";

interface Props {
  usageId: string;
  brides: { id: string; name: string }[];
  initial: {
    bride_id: string;
    usage_date: string;
    quantity_used: number;
    notes: string;
    entryLabel: string;
    stockUnit: "roll" | "pieces";
    available: number;
  };
}

export function EditUsageForm({ usageId, brides, initial }: Props) {
  const router = useRouter();
  const [brideId, setBrideId] = useState(initial.bride_id);
  const [usageDate, setUsageDate] = useState(initial.usage_date);
  const [quantity, setQuantity] = useState(String(initial.quantity_used));
  const [notes, setNotes] = useState(initial.notes);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRoll = initial.stockUnit === "roll";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await updateUsage(usageId, {
      bride_id: brideId,
      usage_date: usageDate,
      quantity_used: Number(quantity),
      notes: notes || null,
    });

    if (result && "error" in result && result.error) {
      setError(typeof result.error === "string" ? result.error : "Failed to save");
      setLoading(false);
      return;
    }

    router.push("/usage");
  }

  return (
    <Card className="max-w-lg">
      <CardHeader><CardTitle>Edit Usage</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Bride</Label>
            <SearchableSelect
              options={brides.map((b) => ({ value: b.id, label: b.name }))}
              value={brideId}
              onValueChange={(v) => setBrideId(v ?? "")}
              placeholder="Select bride"
              noneLabel={null}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker value={usageDate} onChange={setUsageDate} />
            </div>
            <div className="space-y-2">
              <Label>{isRoll ? "Quantity (m)" : "Quantity (pcs)"}</Label>
              <Input
                type="number"
                step={isRoll ? "0.01" : "1"}
                min={isRoll ? "0.01" : "1"}
                max={initial.available}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Max available: {formatQuantity(initial.available, initial.stockUnit)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Roll / Batch</Label>
            <Input value={initial.entryLabel} disabled className="bg-muted text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Roll/batch cannot be changed — delete and re-log to move to a different roll.</p>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
