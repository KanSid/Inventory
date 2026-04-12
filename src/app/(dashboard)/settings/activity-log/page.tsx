import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ActivityLogFilters } from "@/components/settings/activity-log-filters";
import { formatDate } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  stock_adjustment_added: "Stock Adjustment",
  stock_usage_logged: "Stock Usage",
  shipment_received: "Shipment Received",
  shipment_cancelled: "Shipment Cancelled",
  shipment_created: "Shipment Created",
  user_role_changed: "Role Changed",
  user_deactivated: "User Deactivated",
  user_reactivated: "User Reactivated",
  user_password_reset: "Password Reset",
  config_updated: "Config Updated",
  report_exported: "Report Exported",
  login: "Login",
  logout: "Logout",
};

const ACTION_COLORS: Record<string, string> = {
  stock_adjustment_added: "bg-amber-100 text-amber-700",
  stock_usage_logged: "bg-blue-100 text-blue-700",
  shipment_received: "bg-emerald-100 text-emerald-700",
  shipment_cancelled: "bg-red-100 text-red-700",
  shipment_created: "bg-emerald-50 text-emerald-600",
  user_role_changed: "bg-purple-100 text-purple-700",
  user_deactivated: "bg-red-100 text-red-700",
  user_reactivated: "bg-emerald-100 text-emerald-700",
  user_password_reset: "bg-orange-100 text-orange-700",
  config_updated: "bg-neutral-100 text-neutral-700",
  report_exported: "bg-blue-50 text-blue-600",
};

interface SearchParams {
  user_id?: string;
  action_type?: string;
  from?: string;
  to?: string;
  page?: string;
}

const PAGE_SIZE = 50;

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  // Build query
  let query = supabase
    .from("inventory_activity_log")
    .select("*, profiles:user_id(full_name, role)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.user_id) query = query.eq("user_id", params.user_id);
  if (params.action_type) query = query.eq("action_type", params.action_type);
  if (params.from) query = query.gte("created_at", params.from);
  if (params.to) {
    const toDate = new Date(params.to);
    toDate.setDate(toDate.getDate() + 1);
    query = query.lt("created_at", toDate.toISOString());
  }

  const { data: logs, count } = await query;

  // Resolve any UUID values stored in details (from older log entries)
  const isUuid = (v: unknown): v is string =>
    typeof v === "string" && v.length === 36 && v.includes("-");

  const rollIds = new Set<string>();
  const brideIds = new Set<string>();
  const productIds = new Set<string>();

  for (const log of logs ?? []) {
    const d = log.details as Record<string, unknown> | null;
    if (!d) continue;
    if (isUuid(d.roll)) rollIds.add(d.roll);
    if (isUuid(d.roll_id)) rollIds.add(d.roll_id);
    if (isUuid(d.bride)) brideIds.add(d.bride);
    if (isUuid(d.bride_id)) brideIds.add(d.bride_id);
    if (isUuid(d.product)) productIds.add(d.product);
    if (isUuid(d.product_id)) productIds.add(d.product_id);
  }

  const [rollsRes, bridesRes, productsRes] = await Promise.all([
    rollIds.size > 0
      ? supabase.from("rolls").select("id, roll_number").in("id", [...rollIds])
      : { data: [] },
    brideIds.size > 0
      ? supabase.from("brides").select("id, name").in("id", [...brideIds])
      : { data: [] },
    productIds.size > 0
      ? supabase.from("products").select("id, item_code").in("id", [...productIds])
      : { data: [] },
  ]);

  const rollMap = Object.fromEntries((rollsRes.data ?? []).map((r) => [r.id, r.roll_number]));
  const brideMap = Object.fromEntries((bridesRes.data ?? []).map((b) => [b.id, b.name]));
  const productMap = Object.fromEntries((productsRes.data ?? []).map((p) => [p.id, p.item_code]));

  // Load users for filter dropdown
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("is_active", true)
    .order("full_name");

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const actionTypes = Object.keys(ACTION_LABELS);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Immutable timeline of all system events"
      />

      <ActivityLogFilters
        users={users ?? []}
        actionTypes={actionTypes}
        currentFilters={params}
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!logs || logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      No activity found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const actor = log.profiles as { full_name: string; role: string } | null;
                    const label = ACTION_LABELS[log.action_type] ?? log.action_type;
                    const colorClass = ACTION_COLORS[log.action_type] ?? "bg-neutral-100 text-neutral-600";
                    const resolveDetailValue = (k: string, v: unknown): string => {
                      if (!isUuid(v)) return String(v);
                      if (k === "roll" || k === "roll_id") return rollMap[v] ?? v;
                      if (k === "bride" || k === "bride_id") return brideMap[v] ?? v;
                      if (k === "product" || k === "product_id") return productMap[v] ?? v;
                      return v;
                    };
                    const KEY_ORDER = ["roll", "roll_id", "bride", "bride_id", "product", "product_id", "quantity_used", "remaining"];
                    const detailsStr = log.details && Object.keys(log.details).length > 0
                      ? Object.entries(log.details as Record<string, unknown>)
                          .sort(([a], [b]) => {
                            const ai = KEY_ORDER.indexOf(a);
                            const bi = KEY_ORDER.indexOf(b);
                            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
                          })
                          .slice(0, 5)
                          .map(([k, v]) => {
                            const readableKey = k.replace(/_/g, " ").replace(/id$/i, "");
                            return `${readableKey}: ${resolveDetailValue(k, v)}`;
                          })
                          .join(" · ")
                      : "—";
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{actor?.full_name ?? "—"}</span>
                            {actor?.role && (
                              <span className="text-xs text-muted-foreground capitalize">
                                {actor.role.replace("_", " ")}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
                            {label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground capitalize">
                          {log.entity_type?.replace(/_/g, " ") ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-xs truncate">
                          {detailsStr}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, count ?? 0)} of {count ?? 0} entries
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                className="rounded border px-3 py-1 hover:bg-neutral-100 transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                className="rounded border px-3 py-1 hover:bg-neutral-100 transition-colors"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
