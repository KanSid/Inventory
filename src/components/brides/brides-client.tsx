"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
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
import { LayoutGrid, List, Plus, Search } from "lucide-react";
import { createBride } from "@/actions/bride";
import { formatDate } from "@/lib/utils";
import type { Bride } from "@/types";

interface Props {
  brides: Bride[];
  canEdit: boolean;
}

function BridesTable({ brides }: { brides: Bride[] }) {
  const router = useRouter();
  return (
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
            {brides.map((b) => (
              <TableRow
                key={b.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/brides/${b.id}`)}
              >
                <TableCell className="font-serif text-base text-primary">{b.name}</TableCell>
                <TableCell className="text-muted-foreground">{b.phone || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{b.email || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{b.wedding_date ? formatDate(b.wedding_date) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function BridesClient({ brides, canEdit }: Props) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [sortBy, setSortBy] = useState<"wedding_date" | "name">("wedding_date");
  const [sortAsc, setSortAsc] = useState(true);
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

  function sortBrides(list: Bride[]) {
    return [...list].sort((a, b) => {
      if (sortBy === "name") {
        const cmp = a.name.localeCompare(b.name);
        return sortAsc ? cmp : -cmp;
      }
      const da = a.wedding_date ?? "";
      const db = b.wedding_date ?? "";
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      const cmp = da.localeCompare(db);
      return sortAsc ? cmp : -cmp;
    });
  }

  const upcoming = sortBrides(filtered.filter((b) => !b.wedding_date || b.wedding_date >= today));
  const archived = sortBrides(filtered.filter((b) => b.wedding_date && b.wedding_date < today));

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
              <DatePicker id="bride-date" value={weddingDate} onChange={setWeddingDate} />
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

      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search brides..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex rounded-md border">
          <Button
            type="button"
            variant={sortBy === "wedding_date" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-r-none text-xs px-2.5 gap-1"
            onClick={() => { if (sortBy === "wedding_date") setSortAsc((a) => !a); else { setSortBy("wedding_date"); setSortAsc(true); } }}
          >
            Date {sortBy === "wedding_date" ? (sortAsc ? "↑" : "↓") : ""}
          </Button>
          <Button
            type="button"
            variant={sortBy === "name" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-l-none text-xs px-2.5 gap-1"
            onClick={() => { if (sortBy === "name") setSortAsc((a) => !a); else { setSortBy("name"); setSortAsc(true); } }}
          >
            Name {sortBy === "name" ? (sortAsc ? "↑" : "↓") : ""}
          </Button>
        </div>
        <div className="flex rounded-md border">
          <Button
            type="button"
            variant={view === "table" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-r-none"
            onClick={() => setView("table")}
            aria-label="Table view"
          >
            <List size={16} />
          </Button>
          <Button
            type="button"
            variant={view === "cards" ? "secondary" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => setView("cards")}
            aria-label="Card view"
          >
            <LayoutGrid size={16} />
          </Button>
        </div>
      </div>

      {/* Active Commissions */}
      {upcoming.length > 0 && (
        <section className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Active Commissions · {upcoming.length}
          </p>
          {view === "table" ? (
            <BridesTable brides={upcoming} />
          ) : (
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
          )}
        </section>
      )}

      {/* Archived Commissions — table */}
      {archived.length > 0 && (
        <section className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Archived Commissions · {archived.length}
          </p>
          <BridesTable brides={archived} />
        </section>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          {brides.length === 0 ? "No brides yet. Add one to start tracking their commission." : "No brides match your search."}
        </div>
      )}
    </div>
  );
}
