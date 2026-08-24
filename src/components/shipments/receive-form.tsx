"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageCheck, Plus, Trash2 } from "lucide-react";
import { receiveShipmentVerified } from "@/actions/shipment";
import { formatDate } from "@/lib/utils";

interface ShipmentItem {
  id: string;
  product_id: string;
  quantity: number;
  input_unit: string;
  quantity_in_meters: number;
  num_rolls: number;
  roll_lengths: number[] | null;
  notes: string | null;
  products: {
    item_code: string;
    description: string;
    categories: { unit: string } | null;
  } | null;
  suppliers: { name: string } | null;
}

interface ReceivedState {
  rollLengths: (number | null)[];
  qty: number | null;
}

interface Props {
  shipment: {
    id: string;
    shipment_number: string;
    date: string | null;
    status: string;
  };
  items: ShipmentItem[];
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function ReceiveForm({ shipment, items }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [receivedNotes, setReceivedNotes] = useState("");
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [received, setReceived] = useState<Record<string, ReceivedState>>(() => {
    const init: Record<string, ReceivedState> = {};
    items.forEach((item) => {
      const stockUnit = item.products?.categories?.unit ?? "roll";
      if (stockUnit === "pieces") {
        init[item.id] = { rollLengths: [], qty: null };
      } else {
        init[item.id] = { rollLengths: Array(item.num_rolls).fill(null), qty: null };
      }
    });
    return init;
  });

  function addRoll(itemId: string) {
    setReceived((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], rollLengths: [...prev[itemId].rollLengths, null] },
    }));
  }

  function removeRoll(itemId: string, idx: number) {
    setReceived((prev) => {
      const newLengths = prev[itemId].rollLengths.filter((_, i) => i !== idx);
      return { ...prev, [itemId]: { ...prev[itemId], rollLengths: newLengths } };
    });
  }

  function updateRollLength(itemId: string, idx: number, raw: string) {
    const val = raw === "" ? null : round1(Number(raw));
    setReceived((prev) => {
      const newLengths = [...prev[itemId].rollLengths];
      newLengths[idx] = Number.isNaN(val as number) ? null : val;
      return { ...prev, [itemId]: { ...prev[itemId], rollLengths: newLengths } };
    });
  }

  function updateQty(itemId: string, raw: string) {
    const val = raw === "" ? null : Math.round(Number(raw));
    setReceived((prev) => ({ ...prev, [itemId]: { ...prev[itemId], qty: Number.isNaN(val as number) ? null : val } }));
  }

  const discrepancies = useMemo(() => {
    return items.filter((item) => {
      const stockUnit = item.products?.categories?.unit ?? "roll";
      const rec = received[item.id];
      if (!rec) return false;
      if (stockUnit === "pieces") {
        return rec.qty !== null && rec.qty !== Math.round(item.quantity_in_meters);
      }
      const expCount = item.num_rolls;
      if (rec.rollLengths.length !== expCount) return true;
      const defaultLen = round1(item.quantity_in_meters / item.num_rolls);
      return rec.rollLengths.some((l, i) => {
        if (l === null) return false;
        const expLen = item.roll_lengths?.[i] != null ? round1(item.roll_lengths[i]) : defaultLen;
        return l !== expLen;
      });
    });
  }, [items, received]);

  async function handleSubmit() {
    if (!receivedDate) {
      alert("Enter the received date");
      return;
    }
    for (const item of items) {
      const stockUnit = item.products?.categories?.unit ?? "roll";
      const rec = received[item.id];
      if (stockUnit === "pieces" && rec.qty === null) {
        alert(`Enter received quantity for ${item.products?.item_code}`);
        return;
      }
      if (stockUnit !== "pieces" && rec.rollLengths.some((l) => l === null)) {
        alert(`Enter all roll lengths for ${item.products?.item_code}`);
        return;
      }
    }

    setLoading(true);
    const itemData = items.map((item) => {
      const rec = received[item.id];
      const stockUnit = item.products?.categories?.unit ?? "roll";
      const filledLengths = rec.rollLengths.filter((l): l is number => l !== null);
      return {
        itemId: item.id,
        receivedQuantityInMeters: stockUnit === "pieces" ? (rec.qty ?? 0) : filledLengths.reduce((a, b) => a + b, 0),
        receivedNumRolls: stockUnit === "pieces" ? 1 : filledLengths.length,
        receivedRollLengths: stockUnit === "pieces" ? [] : filledLengths,
      };
    });

    const result = await receiveShipmentVerified(shipment.id, itemData, receivedDate, receivedNotes.trim() || undefined);
    if ("error" in result) {
      alert(result.error);
      setLoading(false);
      return;
    }
    router.push(`/shipments/${shipment.id}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Shipment</p>
          <p className="mt-0.5 font-medium">{shipment.shipment_number}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="mb-1 text-xs text-muted-foreground">
            Received date <span className="text-destructive">*</span>
          </p>
          <DatePicker
            value={receivedDate}
            onChange={setReceivedDate}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Discrepancies</p>
          <p className={`mt-0.5 font-medium ${discrepancies.length > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {discrepancies.length === 0 ? "None" : `${discrepancies.length} item${discrepancies.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>Items — enter received quantities</span>
            {discrepancies.length > 0 && (
              <span className="text-xs font-normal text-amber-600">
                {discrepancies.length} discrepanc{discrepancies.length > 1 ? "ies" : "y"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="divide-y">
            {items.map((item) => {
              const stockUnit = item.products?.categories?.unit ?? "roll";
              const rec = received[item.id];
              const isDisc = discrepancies.some((d) => d.id === item.id);
              const defaultLen = round1(item.quantity_in_meters / item.num_rolls);

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  {/* Product header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{item.products?.item_code}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{item.products?.description}</span>
                      {item.suppliers?.name && (
                        <span className="ml-2 text-xs text-muted-foreground">· {item.suppliers.name}</span>
                      )}
                    </div>
                    {isDisc && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Discrepancy
                      </span>
                    )}
                  </div>

                  {/* Grid: label | expected | received | action */}
                  <div className="grid grid-cols-[1fr_90px_90px_28px] items-center gap-x-3 gap-y-2">
                    {/* Column headers */}
                    <div />
                    <p className="text-right text-xs text-muted-foreground">Expected</p>
                    <p className="text-right text-xs text-muted-foreground">Received</p>
                    <div />

                    {stockUnit === "pieces" ? (
                      <>
                        <p className="text-sm text-muted-foreground">Quantity (pcs)</p>
                        <p className="text-right text-sm">{Math.round(item.quantity_in_meters)}</p>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="—"
                          value={rec.qty ?? ""}
                          onChange={(e) => updateQty(item.id, e.target.value)}
                          className={`h-8 text-right text-sm ${
                            rec.qty !== null && rec.qty !== Math.round(item.quantity_in_meters)
                              ? "border-amber-400 focus-visible:ring-amber-400"
                              : ""
                          }`}
                        />
                        <div />
                      </>
                    ) : (
                      <>
                        {/* Rolls count row */}
                        <p className="text-sm text-muted-foreground">No. of rolls</p>
                        <p className="text-right text-sm">{item.num_rolls}</p>
                        <p className={`text-right text-sm font-medium ${
                          rec.rollLengths.length !== item.num_rolls ? "text-amber-600" : "text-muted-foreground"
                        }`}>
                          {rec.rollLengths.length}
                        </p>
                        <div />

                        {/* One row per roll */}
                        {rec.rollLengths.map((len, idx) => {
                          const expLen = idx < item.num_rolls
                            ? (item.roll_lengths?.[idx] != null ? round1(item.roll_lengths[idx]) : defaultLen)
                            : null;
                          const hasMismatch = len !== null && expLen !== null && len !== expLen;
                          return (
                            <>
                              <p key={`lbl-${idx}`} className="text-sm text-muted-foreground">
                                Roll {idx + 1} (m)
                              </p>
                              <p key={`exp-${idx}`} className="text-right text-sm text-muted-foreground">
                                {expLen ?? "—"}
                              </p>
                              <Input
                                key={`inp-${idx}`}
                                type="number"
                                min={0.1}
                                step={0.1}
                                placeholder="—"
                                value={len ?? ""}
                                onChange={(e) => updateRollLength(item.id, idx, e.target.value)}
                                className={`h-8 text-right text-sm ${
                                  hasMismatch ? "border-amber-400 focus-visible:ring-amber-400" : ""
                                }`}
                              />
                              <button
                                key={`del-${idx}`}
                                type="button"
                                onClick={() => removeRoll(item.id, idx)}
                                className="flex items-center justify-center text-muted-foreground hover:text-destructive"
                                aria-label={`Remove roll ${idx + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          );
                        })}

                        {/* Add roll */}
                        <div className="col-span-4 pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => addRoll(item.id)}
                          >
                            <Plus size={13} className="mr-1" />
                            Add roll
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Notes / discrepancy reason
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Optional — describe any quantity differences, missing rolls, or damaged items..."
            value={receivedNotes}
            onChange={(e) => setReceivedNotes(e.target.value)}
            rows={2}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Link href={`/shipments/${shipment.id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          <PackageCheck size={16} className="mr-2" />
          {loading ? "Receiving..." : discrepancies.length > 0 ? "Confirm with discrepancies" : "Confirm receipt"}
        </Button>
      </div>
    </div>
  );
}
