import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";

export default async function SuppliersPage() {
  const supabase = await createClient();
  const { data: suppliers } = await supabase.from("suppliers").select("*").order("name");

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Suppliers"
        description={`${suppliers?.length ?? 0} supplier${(suppliers?.length ?? 0) !== 1 ? "s" : ""} in directory`}
        action={
          isAdmin ? (
            <Link href="/suppliers/new">
              <Button>
                <Plus size={16} className="mr-2" />
                Add Supplier
              </Button>
            </Link>
          ) : undefined
        }
      />

      {!suppliers || suppliers.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">No suppliers yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suppliers.map((s) => (
            <div key={s.id} className="rounded-lg bg-card shadow-sm p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-serif text-base text-primary">
                    {s.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-lg text-foreground leading-tight truncate">{s.name}</p>
                  {s.contact_person && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.contact_person}</p>
                  )}
                </div>
              </div>

              {/* Contact details */}
              <div className="space-y-1.5">
                {s.phone && (
                  <p className="text-sm text-muted-foreground">{s.phone}</p>
                )}
                {s.email && (
                  <p className="text-sm text-muted-foreground truncate">{s.email}</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                  s.is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {s.is_active ? "Active" : "Inactive"}
                </span>
                <Link
                  href={`/suppliers/${s.id}`}
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
