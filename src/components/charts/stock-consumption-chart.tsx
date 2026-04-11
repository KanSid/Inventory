"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ConsumptionData {
  week: string;
  [productCode: string]: number | string;
}

export function StockConsumptionChart({ data }: { data: ConsumptionData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Consumption Trends</CardTitle>
          <CardDescription>Weekly material usage by product (past 12 weeks)</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          No consumption data available
        </CardContent>
      </Card>
    );
  }

  const productCodes = Object.keys(data[0]).filter((k) => k !== "week");
  const colors = ["#C82A5F", "#E85C8A", "#F08FA8", "#94C0D8", "#5B9FBE"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Consumption Trends</CardTitle>
        <CardDescription>Weekly material usage by product (past 12 weeks)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis label={{ value: "Meters", angle: -90, position: "insideLeft" }} />
            <Tooltip formatter={(value) => `${value}m`} />
            <Legend />
            {productCodes.map((code, idx) => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                stroke={colors[idx % colors.length]}
                dot={false}
                name={code}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
