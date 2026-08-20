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
import { formatQuantity, naturalSort } from "@/lib/utils";

interface ProductSummary {
  id: string;
  item_code: string;
  description: string;
  category_id: string;
  image_url: string | null;
  low_stock_threshold: number;
  is_phased_out: boolean;
  type_id: string | null;
  costing_category_id: string | null;
  design_family_id: string | null;
  comment: string | null;
  total_stock: number;
  active_count: number;
  stock_unit: string;
  stock_status: string;
}

interface Ref {
  id: string;
  name: string;
}

interface Props {
  products: ProductSummary[];
  categories: Ref[];
  productTypes: Ref[];
  costingCategories: Ref[];
  designFamilies: Ref[];
  canEdit: boolean;
}

type SortKey = "item_code" | "description" | "total_stock" | "active_count";

export function ProductsClient({ products, categories, productTypes, costingCategories, designFamilies, canEdit }: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("item_code");
  const [sortAsc, setSortAsc] = useState(true);

  const catMap = useMemo(() => {
    const m: Record<string, Ref> = {};
    categories.forEach((c) => (m[c.id] = c));
    return m;
  }, [categories]);

  const typeMap = useMemo(() => {
    const m: Record<string, Ref> = {};
    productTypes.forEach((t) => (m[t.id] = t));
    return m;
  }, [productTypes]);

  const costingMap = useMemo(() => {
    const m: Record<string, Ref> = {};
    costingCategories.forEach((c) => (m[c.id] = c));
    return m;
  }, [costingCategories]);

  const designMap = useMemo(() => {
    const m: Record<string, Ref> = {};
    designFamilies.forEach((d) => (m[d.id] = d));
    return m;
  }, [designFamilies]);

  const filtered = useMemo(() => {
    let list = products;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const typeName = p.type_id ? (typeMap[p.type_id]?.name ?? "").toLowerCase() : "";
        return (
          (p.item_code ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          typeName.includes(q)
        );
      });
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
        return sortAsc ? naturalSort(aVal, bVal) : naturalSort(bVal, aVal);
      }
      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return list;
  }, [products, search, categoryFilter, statusFilter, sortBy, sortAsc, typeMap]);

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
            <SelectValue placeholder="All Categories">
              {(value: string) => value === "all" || !value ? "All Categories" : (catMap[value]?.name ?? "All Categories")}
            </SelectValue>
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
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => toggleSort("item_code")}>
                  Code{sortIndicator("item_code")}
                </TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap text-right" onClick={() => toggleSort("total_stock")}>
                  Stock{sortIndicator("total_stock")}
                </TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap text-right" onClick={() => toggleSort("active_count")}>
                  Rolls{sortIndicator("active_count")}
                </TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Type</TableHead>
                <TableHead className="whitespace-nowrap">Design Family</TableHead>
                <TableHead className="whitespace-nowrap">Costing Category</TableHead>
                <TableHead className="cursor-pointer whitespace-nowrap" onClick={() => toggleSort("description")}>
                  Description{sortIndicator("description")}
                </TableHead>
                <TableHead className="whitespace-nowrap">Comment</TableHead>
                <TableHead className="whitespace-nowrap text-right">Low Stock At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="py-12 text-center text-muted-foreground">
                    {products.length === 0 ? "No products yet." : "No products match your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const cat = catMap[p.category_id];
                  const type = p.type_id ? typeMap[p.type_id] : null;
                  const costing = p.costing_category_id ? costingMap[p.costing_category_id] : null;
                  const design = p.design_family_id ? designMap[p.design_family_id] : null;
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
                        <Link href={`/products/${p.id}`} className="font-medium text-primary hover:underline">
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
                      <TableCell className="text-right font-medium">
                        {formatQuantity(p.total_stock, p.stock_unit as "roll" | "pieces")}
                      </TableCell>
                      <TableCell className="text-right">{p.stock_unit === "roll" ? p.active_count : "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.stock_status as "in_stock" | "low_stock" | "out_of_stock" | "phased_out"} />
                      </TableCell>
                      <TableCell>
                        {type ? (
                          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {type.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {design ? (
                          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {design.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {costing ? (
                          <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                            {costing.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/products/${p.id}`}>{p.description}</Link>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {p.comment ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatQuantity(p.low_stock_threshold, p.stock_unit as "roll" | "pieces")}
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
