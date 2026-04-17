"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ATELIER_CHART_COLORS } from "@/lib/constants";

interface ProductUsageData {
  product: string;
  totalUsed: number;
}

const header = (
  <>
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Usage</p>
    <h3 className="font-serif text-lg text-foreground">Top Products by Usage</h3>
    <p className="text-sm text-muted-foreground mt-0.5 mb-4">Products ranked by total meters consumed</p>
  </>
);

// Gradient from primary to tertiary across bars
const BAR_COLORS = [
  ATELIER_CHART_COLORS.primary,
  ATELIER_CHART_COLORS.secondary,
  ATELIER_CHART_COLORS.tertiary,
  ATELIER_CHART_COLORS.accent,
  ATELIER_CHART_COLORS.complementary,
];

export function TopProductsChart({ data }: { data: ProductUsageData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          {header}
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No usage data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {header}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d5" vertical={false} />
            <XAxis dataKey="product" angle={-35} textAnchor="end" tick={{ fontSize: 11, fill: "#9e8e79" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9e8e79" }} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}m`} />
            <Tooltip contentStyle={{ background: "#faf9f6", border: "none", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 12 }} formatter={(value) => [`${value}m`, "Total Used"]} />
            <Bar dataKey="totalUsed" name="Total Used (m)" radius={[3, 3, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
