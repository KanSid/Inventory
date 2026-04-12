"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/category";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  productCounts: Record<string, number>;
  canEdit: boolean;
  canDelete: boolean;
}

export function CategoriesClient({ categories, productCounts, canEdit, canDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setError("");
    setOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = { name, description: description || null };
    const result = editing
      ? await updateCategory(editing.id, data)
      : await createCategory(data);

    if ("error" in result) {
      const err = result.error;
      const msg = typeof err === "string"
        ? err
        : Object.values(err as Record<string, string[]>).flat().join(", ");
      setError(msg);
    } else {
      setOpen(false);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    const result = await deleteCategory(id);
    if ("error" in result && result.error) {
      alert(result.error);
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage material categories"
        action={
          canEdit ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                className="inline-flex items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                onClick={openCreate}
              >
                <Plus size={16} className="mr-2" />
                Add Category
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Lace, Chiffon"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Description (optional)</Label>
                    <Textarea
                      id="desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={loading}>
                      {loading ? "Saving..." : editing ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No categories yet. Add your first category to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{cat.name}</CardTitle>
                {canEdit && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(cat)}
                    >
                      <Pencil size={14} />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleteId === cat.id}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {productCounts[cat.id] || 0} product(s)
                </p>
                {cat.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
