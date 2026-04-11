"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createProduct, updateProduct } from "@/actions/product";
import { uploadProductImage } from "@/actions/upload";
import type { Product, Category } from "@/types";

interface Props {
  categories: Category[];
  product?: Product;
}

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [itemCode, setItemCode] = useState(product?.item_code ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [subType, setSubType] = useState(product?.sub_type ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(String(product?.low_stock_threshold ?? 10));
  const [notes, setNotes] = useState(product?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const result = await uploadProductImage(file);

    if ("error" in result) {
      setUploadError(result.error);
      setUploading(false);
      return;
    }

    setImageUrl(result.url);
    setUploading(false);
    // Reset input
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const data = {
      item_code: itemCode,
      description,
      category_id: categoryId,
      sub_type: subType || null,
      image_url: imageUrl || null,
      low_stock_threshold: Number(lowStockThreshold),
      notes: notes || null,
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="item_code">Item Code</Label>
              <Input
                id="item_code"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="e.g. AL001, FLR002"
                required
              />
              {errors.item_code && <p className="text-xs text-red-500">{errors.item_code[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-xs text-red-500">{errors.category_id[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Chiffon Ivory, Crepe Satin White"
              required
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description[0]}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sub_type">Sub-type (optional)</Label>
              <Input
                id="sub_type"
                value={subType}
                onChange={(e) => setSubType(e.target.value)}
                placeholder="e.g. Applique, Beaded, Crochet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="low_stock_threshold">Low Stock Threshold (meters)</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                step="0.5"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
            </div>
          </div>

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
                  JPG, PNG, WebP • Max 5MB • On mobile: tap to open camera
                </p>
              </div>
            </div>
            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
            {uploading && <p className="text-xs text-blue-600">Uploading...</p>}

            {imageUrl && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">Preview:</p>
                <div className="relative inline-block">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    className="h-24 w-24 rounded-md border object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-muted-foreground break-all">{imageUrl}</p>
              </div>
            )}
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

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={loading || uploading}>
              {loading ? "Saving..." : uploading ? "Uploading image..." : isEdit ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
