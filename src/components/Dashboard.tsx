"use client";

/**
 * Dashboard.tsx — Main orchestrator for the Economix dashboard.
 *
 * Responsibilities:
 * 1. Manages all UI state (selected indicators, date range, display mode)
 * 2. Fetches data from API routes when selection or date range changes
 * 3. Processes raw time-series data into chart-ready format
 * 4. Computes statistics (current value, change, percentage)
 * 5. Renders the full dashboard layout with controls, chart, and stats
 *
 * Data flow:
 *   User interaction → state update → fetchData() → process → render
 *
 * @see README.md for architecture diagram
 */

import * as React from "react";
import { Loader2 } from "lucide-react";
import { IndicatorSelector } from "./IndicatorSelector";
import { DatePickerRange } from "./DatePickerRange";
import { ValueModeSelector } from "./ValueModeSelector";
import { DataChart } from "./DataChart";
import { StatsCards } from "./StatsCards";
import { indicators } from "@/lib/indicators";
import type {
  TimeSeriesData,
  ChartDataPoint,
  ValueMode,
  DateRange,
  StatsData,
} from "@/types";

/**
 * Color palette for chart lines.
 * Colors are assigned by selection order, not indicator ID.
 * Adding more colors allows more simultaneous indicators.
 */
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

/**
 * Transforms raw time-series data into chart-ready format.
 *
 * Handles 4 display modes:
 * - "value": raw numerical values (default)
 * - "valueChange": absolute change from previous data point
 * - "percentage": percentage change from previous data point
 * - "percentageChange": alias for percentage
 *
 * Multiple indicators are merged by date into a single array,
 * where each object has a `date` key and one key per indicator ID.
 *
 * @param allData - Array of TimeSeriesData, one per selected indicator
 * @param mode - How to transform the values
 * @returns Sorted array of ChartDataPoint for Recharts
 */
function processDataForChart(
  allData: TimeSeriesData[],
  mode: ValueMode
): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>();

  allData.forEach((series) => {
    series.data.forEach((point, index) => {
      let displayValue: number;

      switch (mode) {
        case "valueChange":
          // Absolute change: current - previous
          displayValue =
            index > 0 ? point.value - series.data[index - 1].value : 0;
          break;
        case "percentage":
        case "percentageChange":
          // Percentage change: ((current - previous) / previous) * 100
          displayValue =
            index > 0
              ? ((point.value - series.data[index - 1].value) /
                  series.data[index - 1].value) *
                100
              : 0;
          break;
        default:
          // Raw value
          displayValue = point.value;
      }

      // Merge into date map: one entry per date, with keys for each indicator
      const existing = dateMap.get(point.date);
      if (existing) {
        existing[series.indicatorId] = displayValue;
      } else {
        dateMap.set(point.date, {
          date: point.date,
          [series.indicatorId]: displayValue,
        });
      }
    });
  });

  // Sort by date ascending for chronological chart display
  return Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

/**
 * Computes statistics for each indicator's time series.
 *
 * For each indicator, returns:
 * - currentValue: most recent data point
 * - previousValue: second-to-last data point (for change calculation)
 * - change: absolute difference (current - previous)
 * - changePercent: percentage change
 * - min/max: range across all data points
 *
 * @param allData - Array of TimeSeriesData
 * @returns Array of StatsData, one per indicator
 */
function calculateStats(allData: TimeSeriesData[]): StatsData[] {
  return allData.map((series) => {
    const values = series.data.map((d) => d.value);
    const currentValue = values[values.length - 1] || 0;
    const previousValue = values.length > 1 ? values[values.length - 2] : null;
    const change = previousValue !== null ? currentValue - previousValue : 0;
    const changePercent =
      previousValue !== null && previousValue !== 0
        ? (change / previousValue) * 100
        : 0;

    return {
      indicatorId: series.indicatorId,
      indicatorName: series.indicatorName,
      currentValue,
      previousValue,
      change,
      changePercent,
      min: Math.min(...values),
      max: Math.max(...values),
      unit: series.unit,
    };
  });
}

/**
 * Dashboard component — the main UI orchestrator.
 *
 * State:
 * - selectedIds: which indicators are selected
 * - valueMode: how to display values (raw, change, %, % change)
 * - dateRange: start and end dates for data queries
 * - allData: fetched time-series data from APIs
 * - isLoading: whether data is being fetched
 * - error: error message if fetch fails
 *
 * The component fetches data whenever selectedIds or dateRange changes,
 * using React.useCallback to memoize the fetch function.
 */
export function Dashboard() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [valueMode, setValueMode] = React.useState<ValueMode>("value");
  const [dateRange, setDateRange] = React.useState<DateRange>({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [allData, setAllData] = React.useState<TimeSeriesData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Fetches data for all selected indicators in parallel.
   *
   * For FRED indicators: calls /api/fred with series_id
   * For DBnomics indicators: calls /api/dbnomics with dataset_code and provider_code
   *
   * The dateRange is read from state at call time via closure.
   * This function is memoized with useCallback to prevent unnecessary re-renders.
   */
  const fetchData = React.useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setAllData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          const indicator = indicators.find((i) => i.id === id);
          if (!indicator) throw new Error(`Indicator ${id} not found`);

          // Build API URL based on indicator source
          let url: string;
          if (indicator.source === "fred") {
            const params = new URLSearchParams({
              series_id: indicator.seriesId!,
              start_date: dateRange.startDate,
              end_date: dateRange.endDate,
            });
            url = `/api/fred?${params.toString()}`;
          } else {
            const params = new URLSearchParams({
              dataset_code: indicator.datasetCode!,
              provider_code: indicator.providerCode!,
              start_date: dateRange.startDate,
              end_date: dateRange.endDate,
            });
            url = `/api/dbnomics?${params.toString()}`;
          }

          const response = await fetch(url);
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to fetch data");
          }

          const result = await response.json();
          return {
            indicatorId: id,
            indicatorName: indicator.name,
            unit: indicator.unit || "",
            data: result.observations || [],
          } as TimeSeriesData;
        })
      );

      setAllData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Trigger fetch when selection or date range changes
  React.useEffect(() => {
    fetchData(selectedIds);
  }, [selectedIds, fetchData]);

  // Process data for chart and stats
  const chartData = processDataForChart(allData, valueMode);
  const stats = calculateStats(allData);

  // Map selected indicators to chart-friendly format with colors
  const selectedIndicators = indicators
    .filter((i) => selectedIds.includes(i.id))
    .map((ind, index) => ({
      id: ind.id,
      name: ind.name,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Economix</h1>
            <p className="text-sm text-muted-foreground">
              Economic Data Dashboard
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Data from FRED & DBnomics
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Controls row: indicator selector + date range */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <IndicatorSelector
              indicators={indicators}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
          <DatePickerRange value={dateRange} onChange={setDateRange} />
        </div>

        {/* Value mode selector (right-aligned) */}
        <div className="flex justify-end">
          <ValueModeSelector value={valueMode} onChange={setValueMode} />
        </div>

        {/* Error display */}
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-500">
            {error}
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Stats cards (shown when data is loaded) */}
        {!isLoading && stats.length > 0 && <StatsCards stats={stats} />}

        {/* Chart (shown when data is loaded) */}
        {!isLoading && (
          <DataChart
            data={chartData}
            indicators={selectedIndicators}
            valueMode={valueMode}
            title={
              selectedIds.length > 0
                ? selectedIndicators.map((i) => i.name).join(" vs ")
                : "Time Series Data"
            }
          />
        )}
      </main>
    </div>
  );
}
