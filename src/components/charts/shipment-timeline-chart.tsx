"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ShipmentTimelineData {
  week: string;
  received: number;
  pending: number;
  cancelled?: number;
}

export function ShipmentTimelineChart({ data }: { data: ShipmentTimelineData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipment History</CardTitle>
          <CardDescription>Received shipments by week (past 12 weeks)</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-muted-foreground">
          No shipment data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment History</CardTitle>
        <CardDescription>Received shipments by week (past 12 weeks)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="received" fill="#10B981" name="Received" stackId="a" />
            <Bar dataKey="pending" fill="#F59E0B" name="Pending" stackId="a" />
            {data[0]?.cancelled !== undefined && <Bar dataKey="cancelled" fill="#EF4444" name="Cancelled" stackId="a" />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
