"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusData {
  name: string;
  value: number;
}

export function StockStatusChart({ data }: { data: StatusData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Status Distribution</CardTitle>
          <CardDescription>Products by inventory status</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          No status data available
        </CardContent>
      </Card>
    );
  }

  const COLORS: { [key: string]: string } = {
    in_stock: "#10B981",
    low_stock: "#F59E0B",
    out_of_stock: "#EF4444",
    phased_out: "#9CA3AF",
  };

  const labelMap: Record<string, string> = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    phased_out: "Phased Out",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Status Distribution</CardTitle>
        <CardDescription>Products by inventory status</CardDescription>
      </CardHeader>
      <CardContent>
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
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#8884D8"} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => value} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
