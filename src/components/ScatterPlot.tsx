"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/LocaleContext";
import { pearsonCorrelation } from "@/lib/correlation";
import type { ChartDataPoint, ValueMode } from "@/types";

interface ScatterPlotProps {
  data: ChartDataPoint[];
  indicators: { id: string; name: string; color: string }[];
  rightIndicators?: { id: string; name: string; color: string }[];
  valueMode: ValueMode;
}

const formatValue = (value: number | undefined | null, mode: ValueMode): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }
  if (mode === "percentage" || mode === "percentageChange" || mode === "yoyGrowth") {
    return `${value.toFixed(2)}%`;
  }
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const ScatterTooltip = ({
  active,
  payload,
  valueMode,
}: {
  active?: boolean;
  payload?: Array<{ payload: { x: number; y: number; date: string } }>;
  valueMode: ValueMode;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-lg border bg-background/95 backdrop-blur p-3 shadow-lg">
      <p className="text-sm font-medium mb-1">{point.date}</p>
      <p className="text-sm text-muted-foreground">
        X: <span className="font-medium">{formatValue(point.x, valueMode)}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        Y: <span className="font-medium">{formatValue(point.y, valueMode)}</span>
      </p>
    </div>
  );
};

export function ScatterPlot({
  data,
  indicators,
  rightIndicators = [],
  valueMode,
}: ScatterPlotProps) {
  const { t } = useLocale();
  const allIndicators = React.useMemo(
    () => [...indicators, ...rightIndicators],
    [indicators, rightIndicators]
  );

  // Build scatter data pairs from the first two available indicators
  const scatterData = React.useMemo(() => {
    if (allIndicators.length < 2 || data.length === 0) return null;

    const idA = allIndicators[0].id;
    const idB = allIndicators[1].id;

    const points = data
      .filter((d) => d[idA] != null && d[idB] != null)
      .map((d) => ({
        x: d[idA] as number,
        y: d[idB] as number,
        date: d.date as string,
      }));

    return points;
  }, [data, allIndicators]);

  // Compute correlation for the scatter
  const correlation = React.useMemo(() => {
    if (!scatterData || scatterData.length < 2) return null;
    const x = scatterData.map((p) => p.x);
    const y = scatterData.map((p) => p.y);
    return pearsonCorrelation(x, y);
  }, [scatterData]);

  if (allIndicators.length < 2 || !scatterData || scatterData.length === 0) {
    return null;
  }

  const indicatorA = allIndicators[0];
  const indicatorB = allIndicators[1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {t("scatterPlot")}
          {correlation !== null && (
            <span className="text-sm font-normal text-muted-foreground">
              (r = {correlation >= 0 ? "+" : ""}{correlation.toFixed(3)})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[350px] lg:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                dataKey="x"
                name={indicatorA.name}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatValue(value, valueMode)}
                label={{
                  value: indicatorA.name,
                  position: "insideBottomRight",
                  offset: -5,
                  fontSize: 11,
                  fill: "var(--muted-foreground)",
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={indicatorB.name}
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => formatValue(value, valueMode)}
                label={{
                  value: indicatorB.name,
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  fontSize: 11,
                  fill: "var(--muted-foreground)",
                }}
              />
              <Tooltip content={<ScatterTooltip valueMode={valueMode} />} />
              <Legend />
              <Scatter
                name={`${indicatorA.name} vs ${indicatorB.name}`}
                data={scatterData}
                fill={indicatorA.color}
                fillOpacity={0.7}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
