"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ATELIER_CHART_COLORS } from "@/lib/constants";

interface StatusData {
  name: string;
  value: number;
}

export function StockStatusChart({ data }: { data: StatusData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Stock Status</p>
          <h3 className="font-serif text-lg text-foreground">Stock Status Distribution</h3>
          <p className="text-sm text-muted-foreground mt-0.5 mb-6">Products by inventory status</p>
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No status data available</div>
        </CardContent>
      </Card>
    );
  }

  const COLORS: { [key: string]: string } = {
    in_stock: "#5b8a72",    // sage
    low_stock: "#c4a265",   // bright gold
    out_of_stock: "#735b2c", // harvest gold (dark)
    phased_out: "#c8bfaf",  // warm gray
  };

  const labelMap: Record<string, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    phased_out: "Phased Out",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Stock Status</p>
        <h3 className="font-serif text-lg text-foreground">Stock Status Distribution</h3>
        <p className="text-sm text-muted-foreground mt-0.5 mb-4">Products by inventory status</p>
        <div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => {
                const { name, value } = props;
                return `${labelMap[name] || name}: ${value}`;
              }}
              outerRadius={80}
              fill={ATELIER_CHART_COLORS.primary}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || ATELIER_CHART_COLORS.primary} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#faf9f6", border: "none", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 12 }}
              formatter={(value) => value}
            />
          </PieChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
