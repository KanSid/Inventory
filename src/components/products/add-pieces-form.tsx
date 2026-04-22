"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addPieceBatch } from "@/actions/product";

interface Props {
  productId: string;
  itemCode: string;
}

export function AddPiecesForm({ productId, itemCode }: Props) {
  const router = useRouter();
  const [count, setCount] = useState("");
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await addPieceBatch({
      product_id: productId,
      count: Number(count),
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

    router.push(`/products/${itemCode}`);
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Add pieces to {itemCode}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="count">Number of pieces</Label>
            <Input
              id="count"
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 50"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              required
            />
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
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Pieces"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
