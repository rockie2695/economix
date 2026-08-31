"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDataPoint, ValueMode } from "@/types";

interface DataChartProps {
  data: ChartDataPoint[];
  indicators: { id: string; name: string; color: string }[];
  valueMode: ValueMode;
  title?: string;
}

const CHART_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

const formatValue = (value: number, mode: ValueMode): string => {
  if (mode === "percentage" || mode === "percentageChange") {
    return `${value.toFixed(2)}%`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const CustomTooltip = ({
  active,
  payload,
  label,
  valueMode,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  valueMode: ValueMode;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border bg-background/95 backdrop-blur p-3 shadow-lg">
      <p className="text-sm font-medium mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">
            {formatValue(entry.value, valueMode)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function DataChart({
  data,
  indicators,
  valueMode,
  title = "Time Series Data",
}: DataChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || indicators.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Select indicators to display data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatValue(value, valueMode)}
              />
              <Tooltip content={<CustomTooltip valueMode={valueMode} />} />
              <Legend />
              {indicators.map((indicator, index) => (
                <Line
                  key={indicator.id}
                  type="monotone"
                  dataKey={indicator.id}
                  name={indicator.name}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
