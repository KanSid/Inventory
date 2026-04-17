"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { CHART_COLOR_ARRAY } from "@/lib/constants";

interface ConsumptionData {
  week: string;
  [productCode: string]: number | string;
}

const header = (
  <>
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">Consumption</p>
    <h3 className="font-serif text-lg text-foreground">Stock Consumption Trends</h3>
    <p className="text-sm text-muted-foreground mt-0.5 mb-4">Weekly material usage by product (past 12 weeks)</p>
  </>
);

export function StockConsumptionChart({ data }: { data: ConsumptionData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          {header}
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No consumption data available</div>
        </CardContent>
      </Card>
    );
  }

  const productCodes = Object.keys(data[0]).filter((k) => k !== "week");
  const colors = CHART_COLOR_ARRAY;

  return (
    <Card>
      <CardContent className="p-6">
        {header}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d5" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9e8e79" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9e8e79" }} axisLine={false} tickLine={false} width={32} tickFormatter={(v) => `${v}m`} />
            <Tooltip contentStyle={{ background: "#faf9f6", border: "none", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", fontSize: 12 }} formatter={(value) => `${value}m`} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            {productCodes.map((code, idx) => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                stroke={colors[idx % colors.length]}
                strokeWidth={2}
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
