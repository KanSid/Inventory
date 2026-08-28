import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { StockConsumptionChart } from "@/components/charts/stock-consumption-chart";
import { StockStatusChart } from "@/components/charts/stock-status-chart";
import { TopProductsChart } from "@/components/charts/top-products-chart";
import { ShipmentTimelineChart } from "@/components/charts/shipment-timeline-chart";

// Labels a date by the Monday that starts its calendar week, e.g. "Jun 29" —
// a real, locatable date instead of a month-relative index that resets every month.
function weekLabel(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Sunday .. 6 = Saturday
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);
  return monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: activeRollCount },
    { count: lowStockCount },
    { count: recentShipmentCount },
    { data: statusSummary },
    { data: usageWithProducts },
    { data: shipmentsRaw },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_phased_out", false),
    supabase.from("rolls").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("product_stock_summary").select("*", { count: "exact", head: true }).eq("stock_status", "low_stock"),
    supabase.from("shipments").select("*", { count: "exact", head: true }).eq("status", "received"),
    // Stock status breakdown
    supabase.from("product_stock_summary").select("stock_status"),
    // Usage data for consumption and top products charts
    supabase
      .from("stock_usage")
      .select("*, rolls(products(item_code)), piece_batches(products(item_code))")
      .order("usage_date", { ascending: false })
      .limit(500),
    // Shipment data for timeline
    supabase.from("shipments").select("status, date, created_at").order("created_at", { ascending: false }).limit(200),
  ]);

  // Aggregate status data
  const statusCounts = (statusSummary ?? []).reduce(
    (acc, item) => {
      const status = item.stock_status as string;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const chartStatusData = [
    { name: "in_stock", value: statusCounts["in_stock"] || 0 },
    { name: "low_stock", value: statusCounts["low_stock"] || 0 },
    { name: "out_of_stock", value: statusCounts["out_of_stock"] || 0 },
    { name: "phased_out", value: statusCounts["phased_out"] || 0 },
  ].filter((s) => s.value > 0);

  // Aggregate consumption by week and product
  const consumptionMap = new Map<string, Map<string, number>>();
  (usageWithProducts ?? []).forEach((usage: any) => {
    const date = new Date(usage.usage_date);
    const week = weekLabel(date);
    const productCode = usage.rolls?.products?.item_code || usage.piece_batches?.products?.item_code || "Unknown";
    const qty = usage.quantity_used || 0;

    if (!consumptionMap.has(week)) consumptionMap.set(week, new Map());
    const weekData = consumptionMap.get(week)!;
    weekData.set(productCode, (weekData.get(productCode) || 0) + qty);
  });

  const consumptionChartData = Array.from(consumptionMap.entries())
    .reverse()
    .slice(0, 12)
    .map(([week, products]) => {
      const row: any = { week };
      products.forEach((qty, code) => (row[code] = Math.round(qty * 10) / 10));
      return row;
    });

  // Aggregate top products by total usage
  const productUsageMap = new Map<string, number>();
  (usageWithProducts ?? []).forEach((usage: any) => {
    const productCode = usage.rolls?.products?.item_code || usage.piece_batches?.products?.item_code || "Unknown";
    const qty = usage.quantity_used || 0;
    productUsageMap.set(productCode, (productUsageMap.get(productCode) || 0) + qty);
  });

  const topProductsData = Array.from(productUsageMap.entries())
    .map(([product, totalUsed]) => ({ product, totalUsed: Math.round(totalUsed * 10) / 10 }))
    .sort((a, b) => b.totalUsed - a.totalUsed)
    .slice(0, 10);

  // Aggregate shipments by week
  const shipmentMap = new Map<string, { received: number; pending: number; cancelled: number }>();
  (shipmentsRaw ?? []).forEach((shipment: any) => {
    const date = new Date(shipment.date || shipment.created_at);
    const week = weekLabel(date);

    if (!shipmentMap.has(week)) shipmentMap.set(week, { received: 0, pending: 0, cancelled: 0 });
    const weekData = shipmentMap.get(week)!;
    if (shipment.status === "received") weekData.received++;
    else if (shipment.status === "pending") weekData.pending++;
    else if (shipment.status === "cancelled") weekData.cancelled++;
  });

  const shipmentChartData = Array.from(shipmentMap.entries())
    .reverse()
    .slice(0, 12)
    .map(([week, counts]) => ({ week, ...counts }));

  const stats = [
    { label: "Active Products",   value: productCount ?? 0,        href: "/products" },
    { label: "Active Rolls",      value: activeRollCount ?? 0,     href: "/products" },
    { label: "Low Stock Alerts",  value: lowStockCount ?? 0,       href: "/reports/inventory" },
    { label: "Shipments Received",value: recentShipmentCount ?? 0, href: "/shipments" },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial header */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl lg:text-4xl tracking-tight text-foreground">Inventory Overview</h1>
        <p className="text-sm text-muted-foreground font-sans leading-relaxed">
          Products, rolls, and shipments at a glance.
        </p>
      </div>

      {/* Stat cards — editorial numbered style matching reports page */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="rounded-lg bg-card shadow-sm p-6 flex flex-col justify-between gap-5">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-600">
                {String(i + 1).padStart(2, "0")} · {stat.label}
              </p>
              <p className="font-serif text-5xl text-foreground leading-none">{stat.value}</p>
            </div>
            <div className="flex items-center">
              <div className="h-px flex-1 bg-border/40" />
              <Link
                href={stat.href}
                className="ml-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-warm-600 hover:text-primary transition-colors"
              >
                View →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Charts — keep as is but wrapped in editorial cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StockStatusChart data={chartStatusData} />
        <ShipmentTimelineChart data={shipmentChartData} />
      </div>

      <StockConsumptionChart data={consumptionChartData} />
      <TopProductsChart data={topProductsData} />
    </div>
  );
}
