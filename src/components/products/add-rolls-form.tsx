"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
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
import { addVariableRolls } from "@/actions/product";
import type { RollEntry } from "@/validators/product";

interface Props {
  productId: string;
  itemCode: string;
}

export function AddRollsForm({ productId, itemCode }: Props) {
  const router = useRouter();
  const [rolls, setRolls] = useState<RollEntry[]>([{ length: "", unit: "meters" }]);
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addRollField() {
    setRolls([...rolls, { length: "", unit: "meters" }]);
  }

  function removeRollField(index: number) {
    if (rolls.length > 1) setRolls(rolls.filter((_, i) => i !== index));
  }

  function updateRoll(index: number, field: keyof RollEntry, value: string | number) {
    const updated = [...rolls];
    updated[index] = { ...updated[index], [field]: value };
    setRolls(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await addVariableRolls({
      product_id: productId,
      rolls: rolls.map((r) => ({ length: Number(r.length), unit: r.unit as "meters" | "yards" })),
      received_date: receivedDate,
      notes: notes || null,
    });

    if ("error" in result) {
      const err = result.error;
      const msg = typeof err === "string" ? err : Object.values(err as Record<string, string[]>).flat().join(", ");
      setError(msg);
      setLoading(false);
      return;
    }

    router.push(`/products/${encodeURIComponent(itemCode)}`);
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Add rolls to {itemCode}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>Rolls</Label>
            {rolls.map((roll, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 grid gap-2 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`length-${index}`} className="text-xs">Length</Label>
                    <Input
                      id={`length-${index}`}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 12.5"
                      value={roll.length}
                      onChange={(e) => updateRoll(index, "length", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unit-${index}`} className="text-xs">Unit</Label>
                    <Select value={roll.unit} onValueChange={(v) => v && updateRoll(index, "unit", v)}>
                      <SelectTrigger id={`unit-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meters">Meters</SelectItem>
                        <SelectItem value="yards">Yards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeRollField(index)}
                  disabled={rolls.length === 1}
                  className="h-9"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRollField} className="mt-2">
              + Add Another Roll
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Received Date</Label>
            <DatePicker id="date" value={receivedDate} onChange={setReceivedDate} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <p className="text-sm text-muted-foreground">
            {rolls.length === 1
              ? `This will create 1 roll numbered ${itemCode}-R1.`
              : `This will create ${rolls.length} rolls numbered ${itemCode}-R1 through ${itemCode}-R${rolls.length}.`}
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : rolls.length === 1 ? "Add Roll" : `Add ${rolls.length} Rolls`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
