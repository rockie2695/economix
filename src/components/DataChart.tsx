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
import { useLocale } from "@/lib/LocaleContext";
import type { ChartDataPoint, ValueMode } from "@/types";

interface DataChartProps {
  data: ChartDataPoint[];
  indicators: { id: string; name: string; color: string }[];
  rightIndicators?: { id: string; name: string; color: string }[];
  valueMode: ValueMode;
  title?: string;
}

const formatValue = (value: number | undefined | null, mode: ValueMode): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }
  if (mode === "percentage" || mode === "percentageChange") {
    return `${value.toFixed(2)}%`;
  }
  // Abbreviate large numbers (e.g. 29298013000000 → 29.3T, 331578104 → 331.6M)
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const CustomTooltip = ({
  active,
  payload,
  label,
  valueMode,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | null | undefined; color: string }>;
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
  rightIndicators = [],
  valueMode,
  title,
}: DataChartProps) {
  const { t } = useLocale();
  const displayTitle = title || t("timeSeriesData");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || (indicators.length === 0 && rightIndicators.length === 0) ? (
          <div className="h-[300px] sm:h-[350px] lg:h-[400px] flex items-center justify-center text-muted-foreground">
            {t("selectToDisplay")}
          </div>
        ) : (
          <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) =>
                    formatValue(value, valueMode)
                  }
                />
                {rightIndicators.length > 0 && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) =>
                      formatValue(value, valueMode)
                    }
                  />
                )}
                <Tooltip content={<CustomTooltip valueMode={valueMode} />} />
                <Legend />
                {indicators.map((indicator) => (
                  <Line
                    key={indicator.id}
                    yAxisId="left"
                    type="monotone"
                    dataKey={indicator.id}
                    name={indicator.name}
                    stroke={indicator.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    connectNulls
                  />
                ))}
                {rightIndicators.map((indicator) => (
                  <Line
                    key={indicator.id}
                    yAxisId="right"
                    type="monotone"
                    dataKey={indicator.id}
                    name={indicator.name}
                    stroke={indicator.color}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
