"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { Plus, Search } from "lucide-react";
import { createBride } from "@/actions/bride";
import { formatDate } from "@/lib/utils";
import type { Bride } from "@/types";

interface Props {
  brides: Bride[];
  canEdit: boolean;
}

export function BridesClient({ brides, canEdit }: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = search
    ? brides.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.includes(search) ||
        b.email?.toLowerCase().includes(search.toLowerCase())
      )
    : brides;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await createBride({
      name,
      phone: phone || null,
      email: email || null,
      wedding_date: weddingDate || null,
    });

    if ("error" in result) {
      const err = result.error;
      setError(typeof err === "string" ? err : Object.values(err as Record<string, string[]>).flat().join(", "));
    } else {
      setOpen(false);
      setName("");
      setPhone("");
      setEmail("");
      setWeddingDate("");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brides"
        description={`${brides.length} bride(s)`}
        action={
          canEdit ? (
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => setOpen(true)}>
              <Plus size={16} className="mr-2" />
              Add Bride
            </Button>
          ) : undefined
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bride</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bride-name">Name</Label>
              <Input id="bride-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bride-phone">Phone</Label>
                <Input id="bride-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bride-email">Email</Label>
                <Input id="bride-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bride-date">Wedding Date</Label>
              <Input id="bride-date" type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-rose-600 hover:bg-rose-700" disabled={loading}>
                {loading ? "Saving..." : "Add Bride"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search brides..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Wedding Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    {brides.length === 0 ? "No brides yet." : "No results."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link href={`/brides/${b.id}`} className="font-medium text-rose-600 hover:underline">
                        {b.name}
                      </Link>
                    </TableCell>
                    <TableCell>{b.phone || "—"}</TableCell>
                    <TableCell>{b.email || "—"}</TableCell>
                    <TableCell>{b.wedding_date ? formatDate(b.wedding_date) : "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
