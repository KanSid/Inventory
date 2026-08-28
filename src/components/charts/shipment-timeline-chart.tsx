"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface ShipmentTimelineData {
  week: string;
  received: number;
  pending: number;
  cancelled?: number;
}

export function ShipmentTimelineChart({ data }: { data: ShipmentTimelineData[] }) {
  const header = (
    <>
      <h3 className="font-serif text-lg text-foreground">Shipment History</h3>
      <p className="text-sm text-muted-foreground mt-0.5 mb-4">Received shipments by week (past 12 weeks)</p>
    </>
  );

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          {header}
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No shipment data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {header}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d5" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9e8e79" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9e8e79" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip contentStyle={{ background: "#faf9f6", border: "none", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Bar dataKey="received" fill="#5b8a72" name="Received" stackId="a" radius={[3, 3, 0, 0]} />
            <Bar dataKey="pending" fill="#c4a265" name="Pending" stackId="a" />
            {data[0]?.cancelled !== undefined && <Bar dataKey="cancelled" fill="#8b6e4e" name="Cancelled" stackId="a" />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
