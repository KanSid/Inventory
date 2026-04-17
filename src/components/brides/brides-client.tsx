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

  const today = new Date().toISOString().split("T")[0];
  const upcoming = filtered.filter((b) => !b.wedding_date || b.wedding_date >= today);
  const archived = filtered.filter((b) => b.wedding_date && b.wedding_date < today);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Brides"
        description={`${brides.length} commission${brides.length !== 1 ? "s" : ""} on record`}
        action={
          canEdit ? (
            <Button onClick={() => setOpen(true)}>
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
              <Button type="submit" disabled={loading}>
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

      {/* Active Commissions — card grid */}
      {upcoming.length > 0 && (
        <section className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Active Commissions · {upcoming.length}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((b) => (
              <Link key={b.id} href={`/brides/${b.id}`}>
                <div className="group rounded-lg bg-card border-0 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="font-serif text-base text-primary">{b.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60 group-hover:text-primary transition-colors">
                      View →
                    </span>
                  </div>
                  <div>
                    <p className="font-serif text-lg text-foreground leading-tight">{b.name}</p>
                    {b.phone && <p className="text-xs text-muted-foreground mt-0.5">{b.phone}</p>}
                  </div>
                  <div className="pt-1 border-t border-border/40">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">Wedding</p>
                    <p className="text-sm text-foreground mt-0.5">
                      {b.wedding_date ? formatDate(b.wedding_date) : <span className="text-muted-foreground/50 italic">Not set</span>}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Archived Commissions — table */}
      {archived.length > 0 && (
        <section className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Archived Commissions · {archived.length}
          </p>
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
                  {archived.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <Link href={`/brides/${b.id}`} className="font-serif text-primary hover:underline">
                          {b.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{b.phone || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{b.email || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{b.wedding_date ? formatDate(b.wedding_date) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          {brides.length === 0 ? "No brides yet." : "No results."}
        </div>
      )}
    </div>
  );
}
