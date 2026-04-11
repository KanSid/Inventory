import { createClient } from "@/lib/supabase/server";
import { Package, ScrollText, AlertTriangle, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockConsumptionChart } from "@/components/charts/stock-consumption-chart";
import { StockStatusChart } from "@/components/charts/stock-status-chart";
import { TopProductsChart } from "@/components/charts/top-products-chart";
import { ShipmentTimelineChart } from "@/components/charts/shipment-timeline-chart";

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
    supabase.from("stock_usage").select("*, products(item_code)").order("usage_date", { ascending: false }).limit(500),
    // Shipment data for timeline
    supabase.from("shipments").select("status, received_date, created_at").order("received_date", { ascending: false }).limit(200),
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
    const weekNum = Math.floor((date.getDate() - date.getDay() + 6) / 7);
    const month = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const week = `${month} W${weekNum}`;
    const productCode = usage.products?.item_code || "Unknown";
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
    const productCode = usage.products?.item_code || "Unknown";
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
    const date = new Date(shipment.received_date || shipment.created_at);
    const weekNum = Math.floor((date.getDate() - date.getDay() + 6) / 7);
    const month = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const week = `${month} W${weekNum}`;

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
    { label: "Active Products", value: productCount ?? 0, icon: Package, color: "text-rose-600" },
    { label: "Active Rolls", value: activeRollCount ?? 0, icon: ScrollText, color: "text-blue-600" },
    { label: "Low Stock Alerts", value: lowStockCount ?? 0, icon: AlertTriangle, color: "text-amber-500" },
    { label: "Shipments Received", value: recentShipmentCount ?? 0, icon: Truck, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your inventory</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon size={18} className={stat.color} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StockStatusChart data={chartStatusData} />
        <ShipmentTimelineChart data={shipmentChartData} />
      </div>

      <StockConsumptionChart data={consumptionChartData} />

      <TopProductsChart data={topProductsData} />
    </div>
  );
}
