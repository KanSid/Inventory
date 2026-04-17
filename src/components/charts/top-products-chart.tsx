"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ATELIER_CHART_COLORS } from "@/lib/constants";

interface ProductUsageData {
  product: string;
  totalUsed: number;
}

export function TopProductsChart({ data }: { data: ProductUsageData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products by Usage</CardTitle>
          <CardDescription>Products ranked by total meters consumed</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          No usage data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products by Usage</CardTitle>
        <CardDescription>Products ranked by total meters consumed</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" angle={-45} textAnchor="end" height={100} />
            <YAxis label={{ value: "Meters", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(value) => `${value}m`} />
            <Bar dataKey="totalUsed" fill={ATELIER_CHART_COLORS.primary} name="Total Used (m)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
