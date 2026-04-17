"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Plus, Search } from "lucide-react";
import { formatLength } from "@/lib/utils";

interface ProductSummary {
  id: string;
  item_code: string;
  description: string;
  category_id: string;
  sub_type: string | null;
  image_url: string | null;
  low_stock_threshold: number;
  is_phased_out: boolean;
  total_stock_m: number;
  active_roll_count: number;
  stock_status: string;
}

interface CategoryRef {
  id: string;
  name: string;
}

interface Props {
  products: ProductSummary[];
  categories: CategoryRef[];
  canEdit: boolean;
}

type SortKey = "item_code" | "description" | "total_stock_m" | "active_roll_count";

export function ProductsClient({ products, categories, canEdit }: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("item_code");
  const [sortAsc, setSortAsc] = useState(true);

  const catMap = useMemo(() => {
    const m: Record<string, CategoryRef> = {};
    categories.forEach((c) => (m[c.id] = c));
    return m;
  }, [categories]);

  const filtered = useMemo(() => {
    let list = products;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.item_code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.sub_type?.toLowerCase().includes(q) ?? false)
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category_id === categoryFilter);
    }

    if (statusFilter !== "all") {
      list = list.filter((p) => p.stock_status === statusFilter);
    }

    list = [...list].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return list;
  }, [products, search, categoryFilter, statusFilter, sortBy, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(true); }
  }

  function sortIndicator(key: SortKey) {
    if (sortBy !== key) return "";
    return sortAsc ? " ↑" : " ↓";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`${products.length} material(s)`}
        action={
          canEdit ? (
            <Link href="/products/new">
              <Button>
                <Plus size={16} className="mr-2" />
                Add Product
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code, description, sub-type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="phased_out">Phased Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead className="cursor-pointer" onClick={() => toggleSort("item_code")}>
                  Code{sortIndicator("item_code")}
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("description")}>
                  Description{sortIndicator("description")}
                </TableHead>
                <TableHead>Sub-type</TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("total_stock_m")}>
                  Stock{sortIndicator("total_stock_m")}
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("active_roll_count")}>
                  Rolls{sortIndicator("active_roll_count")}
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    {products.length === 0 ? "No products yet." : "No products match your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const cat = catMap[p.category_id];
                  return (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.description}
                            className="h-9 w-9 rounded-md border object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-md border bg-muted" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/products/${p.item_code}`} className="font-medium text-primary hover:underline">
                          {p.item_code}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {cat ? (
                          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/products/${p.item_code}`}>{p.description}</Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.sub_type || "—"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatLength(p.total_stock_m)}
                      </TableCell>
                      <TableCell className="text-right">{p.active_roll_count}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.stock_status as "in_stock" | "low_stock" | "out_of_stock" | "phased_out"} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
