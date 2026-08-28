"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createProduct, updateProduct } from "@/actions/product";
import { uploadProductImage } from "@/actions/upload";
import type { Product, Category } from "@/types";

interface LookupItem { id: string; name: string; }

interface Props {
  categories: Category[];
  suppliers: LookupItem[];
  productTypes: LookupItem[];
  costingCategories: LookupItem[];
  designFamilies: LookupItem[];
  product?: Product & { supplier_ids?: string[] };
}

export function ProductForm({ categories, suppliers, productTypes, costingCategories, designFamilies, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [itemCode, setItemCode] = useState(product?.item_code ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [typeId, setTypeId] = useState(product?.type_id ?? "");
  const [costingCategoryId, setCostingCategoryId] = useState(product?.costing_category_id ?? "");
  const [designFamilyId, setDesignFamilyId] = useState(product?.design_family_id ?? "");
  const [comment, setComment] = useState(product?.comment ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(String(product?.low_stock_threshold ?? 10));
  const [isPhasedOut, setIsPhasedOut] = useState(product?.is_phased_out ?? false);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>(product?.supplier_ids ?? []);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const stockUnit = selectedCategory?.unit ?? "roll";

  function toggleSupplier(id: string) {
    setSelectedSupplierIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const result = await uploadProductImage(file);
    if ("error" in result) {
      setUploadError(result.error ?? "Upload failed");
      setUploading(false);
      return;
    }
    setImageUrl(result.url);
    setUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const data = {
      item_code: itemCode,
      description: description || null,
      category_id: categoryId,
      image_url: imageUrl || null,
      type_id: typeId || null,
      costing_category_id: costingCategoryId || null,
      design_family_id: designFamilyId || null,
      comment: comment || null,
      low_stock_threshold: Number(lowStockThreshold),
      is_phased_out: isPhasedOut,
      supplier_ids: selectedSupplierIds,
    };

    const result = isEdit
      ? await updateProduct(product!.id, data)
      : await createProduct(data);

    if ("error" in result && result.error) {
      if (typeof result.error === "object") {
        setErrors(result.error as Record<string, string[]>);
      }
      setLoading(false);
      return;
    }

    if ("id" in result && result.id) {
      router.push(`/products/${result.id}`);
    } else if (isEdit) {
      router.push(`/products/${product!.id}`);
    } else {
      router.push("/products");
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Product" : "New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Code + Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="item_code">Item Code</Label>
              <Input
                id="item_code"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="e.g. AL001"
                required
              />
              {errors.item_code && <p className="text-xs text-red-500">{errors.item_code[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <SearchableSelect
                options={categories.map((c) => ({ value: c.id, label: c.name, hint: c.unit }))}
                value={categoryId}
                onValueChange={setCategoryId}
                placeholder="Select category"
                noneLabel={null}
              />
              {selectedCategory && (
                <p className="text-xs text-muted-foreground">Unit: {selectedCategory.unit}</p>
              )}
              {errors.category_id && <p className="text-xs text-red-500">{errors.category_id[0]}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Chiffon Ivory, Crepe Satin White"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description[0]}</p>}
          </div>

          {/* Type + Costing Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type (optional)</Label>
              <SearchableSelect
                options={productTypes.map((t) => ({ value: t.id, label: t.name }))}
                value={typeId}
                onValueChange={setTypeId}
                placeholder="Select type"
              />
            </div>
            <div className="space-y-2">
              <Label>Costing Category (optional)</Label>
              <SearchableSelect
                options={costingCategories.map((c) => ({ value: c.id, label: c.name }))}
                value={costingCategoryId}
                onValueChange={setCostingCategoryId}
                placeholder="Select costing category"
              />
            </div>
          </div>

          {/* Design Family */}
          <div className="space-y-2">
            <Label>Design Family (optional)</Label>
            <SearchableSelect
              options={designFamilies.map((d) => ({ value: d.id, label: d.name }))}
              value={designFamilyId}
              onValueChange={setDesignFamilyId}
              placeholder="Select design family"
            />
          </div>

          {/* Low Stock Threshold */}
          <div className="space-y-2">
            <Label htmlFor="low_stock_threshold">
              Low Stock Threshold ({stockUnit === "pieces" ? "pcs" : "meters"})
            </Label>
            <Input
              id="low_stock_threshold"
              type="number"
              step={stockUnit === "pieces" ? "1" : "0.01"}
              min="0"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
            />
          </div>

          {/* Suppliers */}
          {suppliers.length > 0 && (
            <div className="space-y-2">
              <Label>Suppliers (optional)</Label>
              <div className="rounded-md border">
                <div className="border-b p-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      placeholder="Search suppliers..."
                      className="h-7 w-full rounded-md border border-input bg-transparent pl-7 pr-2 text-sm outline-none focus:border-ring"
                    />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                  {suppliers
                    .filter((s) => s.name.toLowerCase().includes(supplierSearch.toLowerCase()))
                    .map((s) => (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer rounded px-1 py-0.5 hover:bg-muted">
                        <input
                          type="checkbox"
                          checked={selectedSupplierIds.includes(s.id)}
                          onChange={() => toggleSupplier(s.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{s.name}</span>
                      </label>
                    ))}
                  {suppliers.filter((s) => s.name.toLowerCase().includes(supplierSearch.toLowerCase())).length === 0 && (
                    <p className="py-2 text-center text-xs text-muted-foreground">No suppliers found</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Product Image (optional)</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG, WebP • Max 5MB
                </p>
              </div>
            </div>
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
            {uploading && <p className="text-xs text-blue-600">Uploading...</p>}
            {imageUrl && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">Preview:</p>
                <div className="relative inline-block">
                  <Image
                    src={imageUrl}
                    alt="Product preview"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-md border object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>

          {/* Phased Out */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPhasedOut}
                onChange={(e) => setIsPhasedOut(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium">Phased out</span>
            </label>
            <p className="text-xs text-muted-foreground pl-6">
              Hides this product from new shipments, usage, and adjustments. Existing stock stays visible.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? "Saving..." : uploading ? "Uploading image..." : isEdit ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
