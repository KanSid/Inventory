import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MaterialDemandTable, type DemandGroup } from "./client";

// The production app (daisle_production) owns the prod_* tables and writes
// material demand against bride orders. Inventory only reads it here — no stock
// is ever written. prod_* RLS requires is_production_staff(), which inventory
// roles don't satisfy, so we read through the service-role client and gate the
// page to admin / inventory_manager ourselves.

export type DemandFilter = "all" | "low_stock" | "out_of_stock";

type DemandRow = {
  id: string;
  quantity: number | null;
  note: string | null;
  created_at: string;
  prod_orders: {
    current_stage: string | null;
    order_status: string | null;
    wedding_date: string | null;
    store: string | null;
    brides: { name: string | null } | null;
  } | null;
  products: {
    id: string;
    item_code: string | null;
    description: string | null;
    categories: { unit: "roll" | "pieces" } | null;
  } | null;
};

const STATUS_RANK: Record<string, number> = {
  out_of_stock: 0,
  low_stock: 1,
  phased_out: 2,
  unknown: 3,
  in_stock: 4,
};

const TABS: { key: DemandFilter; label: string; href: string }[] = [
  { key: "all", label: "All Demands", href: "/material-demand" },
  { key: "low_stock", label: "Low Stock", href: "/material-demand/low-stock" },
  { key: "out_of_stock", label: "No Stock", href: "/material-demand/out-of-stock" },
];

async function getDemandGroups(): Promise<DemandGroup[]> {
  const admin = await createAdminClient();

  const { data: rows } = await admin
    .from("prod_material_demand")
    .select(
      "id, quantity, note, created_at, " +
        "prod_orders(current_stage, order_status, wedding_date, store, brides(name)), " +
        "products(id, item_code, description, categories(unit))"
    )
    .order("created_at", { ascending: false });

  const demandRows = (rows ?? []) as unknown as DemandRow[];

  const productIds = [
    ...new Set(demandRows.map((r) => r.products?.id).filter((v): v is string => !!v)),
  ];

  const { data: stock } = productIds.length
    ? await admin
        .from("product_stock_summary")
        .select("id, total_stock, stock_status, stock_unit")
        .in("id", productIds)
    : { data: [] as { id: string; total_stock: number; stock_status: string; stock_unit: string }[] };

  const stockById = new Map((stock ?? []).map((s) => [s.id, s]));

  const groups = new Map<string, DemandGroup>();
  for (const r of demandRows) {
    const p = r.products;
    if (!p?.id) continue;
    const s = stockById.get(p.id);
    const unit = p.categories?.unit ?? (s?.stock_unit as "roll" | "pieces") ?? "roll";

    let g = groups.get(p.id);
    if (!g) {
      g = {
        product_id: p.id,
        item_code: p.item_code || "Unknown",
        description: p.description || "",
        stock_unit: unit,
        current_stock: Number(s?.total_stock ?? 0),
        stock_status: s?.stock_status || "unknown",
        total_demanded: 0,
        lines: [],
      };
      groups.set(p.id, g);
    }
    const qty = Number(r.quantity ?? 0);
    g.total_demanded += qty;
    g.lines.push({
      id: r.id,
      bride_name: r.prod_orders?.brides?.name || "—",
      quantity: qty,
      current_stage: r.prod_orders?.current_stage || null,
      order_status: r.prod_orders?.order_status || null,
      wedding_date: r.prod_orders?.wedding_date || null,
      store: r.prod_orders?.store || null,
      note: r.note,
    });
  }

  return [...groups.values()].sort((a, b) => {
    const byStatus = (STATUS_RANK[a.stock_status] ?? 3) - (STATUS_RANK[b.stock_status] ?? 3);
    if (byStatus !== 0) return byStatus;
    return b.total_demanded - a.total_demanded;
  });
}

export async function MaterialDemandView({ filter }: { filter: DemandFilter }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const canView = profile?.role === "admin" || profile?.role === "inventory_manager";
  if (!canView) notFound();

  const allGroups = await getDemandGroups();

  const counts: Record<DemandFilter, number> = {
    all: allGroups.length,
    low_stock: allGroups.filter((g) => g.stock_status === "low_stock").length,
    out_of_stock: allGroups.filter((g) => g.stock_status === "out_of_stock").length,
  };

  const groups =
    filter === "all"
      ? allGroups
      : allGroups.filter((g) => g.stock_status === filter);

  const demandLines = groups.reduce((n, g) => n + g.lines.length, 0);
  const shortfalls = groups.filter((g) => g.total_demanded > g.current_stock).length;

  const active = TABS.find((t) => t.key === filter)!;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-foreground">
            Material Demand
          </h1>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            What bride production orders need from inventory — read-only, sourced from the production app.
          </p>
        </div>
        <div className="flex items-end gap-8">
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Products
            </p>
            <p className="font-serif text-3xl text-foreground leading-none mt-0.5">{groups.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Demand Lines
            </p>
            <p className="font-serif text-3xl text-foreground leading-none mt-0.5">{demandLines}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Shortfalls
            </p>
            <p className={cn("font-serif text-3xl leading-none mt-0.5", shortfalls > 0 ? "text-red-600" : "text-foreground")}>
              {shortfalls}
            </p>
          </div>
        </div>
      </div>

      {/* Filter subpages */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => {
          const isActive = t.key === filter;
          return (
            <Link
              key={t.key}
              href={t.href}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {counts[t.key]}
              </span>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {groups.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {filter === "all"
                ? "No material demand recorded yet."
                : `No ${active.label.toLowerCase()} in current demand.`}
            </p>
          ) : (
            <MaterialDemandTable data={groups} defaultExpanded={filter !== "all"} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
