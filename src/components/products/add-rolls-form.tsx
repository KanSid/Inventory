"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addRolls } from "@/actions/product";

interface Props {
  productId: string;
  itemCode: string;
}

export function AddRollsForm({ productId, itemCode }: Props) {
  const router = useRouter();
  const [numRolls, setNumRolls] = useState("1");
  const [lengthPerRoll, setLengthPerRoll] = useState("");
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await addRolls({
      product_id: productId,
      num_rolls: Number(numRolls),
      length_per_roll: Number(lengthPerRoll),
      received_date: receivedDate,
      notes: notes || null,
    });

    if ("error" in result) {
      const err = result.error;
      const msg = typeof err === "string"
        ? err
        : Object.values(err as Record<string, string[]>).flat().join(", ");
      setError(msg);
      setLoading(false);
      return;
    }

    router.push(`/products/${productId}`);
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>
          Add rolls to {itemCode}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="num_rolls">Number of Rolls</Label>
              <Input
                id="num_rolls"
                type="number"
                min="1"
                max="50"
                value={numRolls}
                onChange={(e) => setNumRolls(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length per Roll (meters)</Label>
              <Input
                id="length"
                type="number"
                step="0.5"
                min="0.5"
                value={lengthPerRoll}
                onChange={(e) => setLengthPerRoll(e.target.value)}
                placeholder="e.g. 12.5"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Received Date</Label>
            <Input
              id="date"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <p className="text-sm text-muted-foreground">
            This will create {numRolls} roll(s) numbered {itemCode}-R?
            {Number(numRolls) > 1 ? ` through ${itemCode}-R?` : ""}, each {lengthPerRoll || "?"}m.
          </p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={loading}>
              {loading ? "Adding..." : `Add ${numRolls} Roll(s)`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
