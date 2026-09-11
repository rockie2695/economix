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
  ReferenceLine,
  Label,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/lib/LocaleContext";
import { getVisibleEvents } from "@/lib/historical-events";
import type { ChartDataPoint, ValueMode } from "@/types";

interface DataChartProps {
  data: ChartDataPoint[];
  indicators: { id: string; name: string; color: string }[];
  rightIndicators?: { id: string; name: string; color: string }[];
  valueMode: ValueMode;
  title?: string;
  showEvents?: boolean;
  showMovingAverage?: boolean;
  movingAverageWindow?: number;
  forecastData?: ChartDataPoint[];
}

const formatValue = (value: number | undefined | null, mode: ValueMode): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }
  if (mode === "percentage" || mode === "percentageChange" || mode === "yoyGrowth") {
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
  showEvents = false,
  showMovingAverage = false,
  movingAverageWindow = 3,
  forecastData,
}: DataChartProps) {
  const { t } = useLocale();
  const displayTitle = title || t("timeSeriesData");

  // Get visible historical events
  const visibleEvents = React.useMemo(() => {
    if (!showEvents || data.length === 0) return [];
    const dates = data.map((d) => d.date as string).sort();
    return getVisibleEvents(dates[0], dates[dates.length - 1]);
  }, [showEvents, data]);

  // Compute moving averages for each indicator
  const movingAverages = React.useMemo(() => {
    if (!showMovingAverage) return {};
    const result: Record<string, (number | null)[]> = {};
    const allInds = [...indicators, ...rightIndicators];
    for (const ind of allInds) {
      const values = data.map((d) => d[ind.id] as number);
      const ma: (number | null)[] = [];
      for (let i = 0; i < values.length; i++) {
        if (i < movingAverageWindow - 1) {
          ma.push(null);
        } else {
          let sum = 0;
          for (let j = i - movingAverageWindow + 1; j <= i; j++) {
            sum += values[j];
          }
          ma.push(sum / movingAverageWindow);
        }
      }
      result[ind.id] = ma;
    }
    return result;
  }, [showMovingAverage, data, indicators, rightIndicators, movingAverageWindow]);

  // Merge forecast data if provided
  const chartData = React.useMemo(() => {
    if (!forecastData || forecastData.length === 0) return data;
    // Add forecast points after the real data
    const forecastPoints = forecastData.filter(
      (fd) => !data.some((d) => d.date === fd.date)
    );
    return [...data, ...forecastPoints];
  }, [data, forecastData]);
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
                {/* Historical events as vertical reference lines */}
                {visibleEvents.map((event) => (
                  <ReferenceLine
                    key={event.date}
                    x={event.date}
                    yAxisId="left"
                    stroke="var(--muted-foreground)"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  >
                    <Label
                      value={event.label}
                      position="top"
                      fontSize={9}
                      fill="var(--muted-foreground)"
                      angle={-45}
                    />
                  </ReferenceLine>
                ))}
                {/* Main indicator lines */}
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
                {/* Moving average lines */}
                {showMovingAverage && indicators.map((indicator) => (
                  <Line
                    key={`ma-${indicator.id}`}
                    yAxisId="left"
                    type="monotone"
                    dataKey={`ma_${indicator.id}`}
                    name={`${indicator.name} MA(${movingAverageWindow})`}
                    stroke={indicator.color}
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    dot={false}
                    connectNulls
                    strokeOpacity={0.6}
                  />
                ))}
                {/* Right axis indicator lines */}
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
                {/* Forecast lines */}
                {forecastData && forecastData.length > 0 && indicators.map((indicator) => (
                  <Line
                    key={`forecast-${indicator.id}`}
                    yAxisId="left"
                    type="monotone"
                    dataKey={`forecast_${indicator.id}`}
                    name={`${indicator.name} (${t("forecast")})`}
                    stroke={indicator.color}
                    strokeWidth={1.5}
                    strokeDasharray="8 4"
                    dot={false}
                    connectNulls
                    strokeOpacity={0.5}
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
