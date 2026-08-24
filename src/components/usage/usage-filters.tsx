"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DatePicker } from "@/components/ui/date-picker";

interface UsageFiltersProps {
  brides: { id: string; name: string }[];
  products: { id: string; item_code: string; description: string }[];
  currentFilters: {
    bride_id?: string;
    product_id?: string;
    roll_number?: string;
    from?: string;
    to?: string;
  };
}

export function UsageFilters({ brides, products, currentFilters }: UsageFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [brideId, setBrideId] = useState(currentFilters.bride_id ?? "");
  const [productId, setProductId] = useState(currentFilters.product_id ?? "");
  const [rollNumber, setRollNumber] = useState(currentFilters.roll_number ?? "");
  const [from, setFrom] = useState(currentFilters.from ?? "");
  const [to, setTo] = useState(currentFilters.to ?? "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (brideId) params.set("bride_id", brideId);
    if (productId) params.set("product_id", productId);
    if (rollNumber) params.set("roll_number", rollNumber);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleReset() {
    setBrideId("");
    setProductId("");
    setRollNumber("");
    setFrom("");
    setTo("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <Card className="overflow-visible">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1 w-44">
            <Label className="text-xs font-medium text-foreground">Bride</Label>
            <SearchableSelect
              options={brides.map((b) => ({ value: b.id, label: b.name }))}
              value={brideId}
              onValueChange={setBrideId}
              placeholder="All brides"
              noneLabel="All brides"
            />
          </div>

          <div className="space-y-1 w-56">
            <Label className="text-xs font-medium text-foreground">Product</Label>
            <SearchableSelect
              options={products.map((p) => ({ value: p.id, label: p.item_code, hint: p.description }))}
              value={productId}
              onValueChange={setProductId}
              placeholder="All products"
              noneLabel="All products"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-foreground">Roll Number</Label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. AL001-R1"
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm focus:border-ring focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-foreground">From Date</Label>
            <DatePicker value={from} onChange={setFrom} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-foreground">To Date</Label>
            <DatePicker value={to} onChange={setTo} />
          </div>

          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={isPending} onClick={applyFilters}>
              Filter
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
