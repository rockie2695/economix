"use client";

import * as React from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";
import useSWR from "swr";
import { IndicatorSelector } from "./IndicatorSelector";
import { DatePickerRange } from "./DatePickerRange";
import { ValueModeSelector } from "./ValueModeSelector";
import { DataChart } from "./DataChart";
import { StatsCards } from "./StatsCards";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ExportButton } from "./ExportButton";
import { indicators } from "@/lib/indicators";
import { CHART_COLORS } from "@/lib/constants";
import { useLocale } from "@/lib/LocaleContext";
import type {
  TimeSeriesData,
  ChartDataPoint,
  ValueMode,
  DateRange,
} from "@/types";

export function processDataForChart(
  allData: TimeSeriesData[],
  mode: ValueMode
): ChartDataPoint[] {
  const dateMap = new Map<string, ChartDataPoint>();

  allData.forEach((series) => {
    series.data.forEach((point, index) => {
      let displayValue: number;

      switch (mode) {
        case "valueChange":
          displayValue =
            index > 0 ? point.value - series.data[index - 1].value : 0;
          break;
        case "percentage":
          displayValue =
            index > 0
              ? ((point.value - series.data[index - 1].value) /
                  series.data[index - 1].value) *
                100
              : 0;
          break;
        case "percentageChange": {
          const baseValue = series.data[0]?.value ?? 0;
          displayValue =
            baseValue !== 0
              ? ((point.value - baseValue) / baseValue) * 100
              : 0;
          break;
        }
        default:
          displayValue = point.value;
      }

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

  return Array.from(dateMap.values()).sort((a, b) =>
    (a.date as string).localeCompare(b.date as string)
  );
}

export function calculateStats(allData: TimeSeriesData[]) {
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

async function fetchEconomicData(
  ids: string[],
  startDate: string,
  endDate: string
): Promise<TimeSeriesData[]> {
  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const indicator = indicators.find((i) => i.id === id);
      if (!indicator) throw new Error(`Indicator ${id} not found`);

      let url: string;
      if (indicator.source === "fred") {
        const params = new URLSearchParams({
          series_id: indicator.seriesId!,
          start_date: startDate,
          end_date: endDate,
        });
        url = `/api/fred?${params.toString()}`;
      } else {
        const params = new URLSearchParams({
          dataset_code: indicator.datasetCode!,
          provider_code: indicator.providerCode!,
          start_date: startDate,
          end_date: endDate,
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

  const successful: TimeSeriesData[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successful.push(result.value);
    } else {
      errors.push(`${ids[index]}: ${result.reason?.message || "Fetch failed"}`);
    }
  });

  if (errors.length > 0) {
    console.warn("Some indicators failed to load:", errors);
  }

  return successful;
}

function readStateFromURL() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const ids = params.get("indicators")?.split(",").filter(Boolean) ?? [];
  const mode = params.get("mode") as ValueMode | null;
  const start = params.get("start");
  const end = params.get("end");

  return {
    selectedIds: ids,
    valueMode: (mode && ["value", "valueChange", "percentage", "percentageChange"].includes(mode)
      ? mode
      : null) as ValueMode | null,
    dateRange:
      start && end ? { startDate: start, endDate: end } : null,
  };
}

export function Dashboard() {
  const { t } = useLocale();
  const [mounted, setMounted] = React.useState(false);

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [valueMode, setValueMode] = React.useState<ValueMode>("value");
  const [dateRange, setDateRange] = React.useState<DateRange>({
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [fetchErrors, setFetchErrors] = React.useState<Map<string, string>>(
    new Map()
  );
  const [loadingIds, setLoadingIds] = React.useState<Set<string>>(new Set());

  // Read from URL on mount
  React.useEffect(() => {
    const urlState = readStateFromURL();
    if (urlState) {
      if (urlState.selectedIds.length > 0) setSelectedIds(urlState.selectedIds);
      if (urlState.valueMode) setValueMode(urlState.valueMode);
      if (urlState.dateRange) setDateRange(urlState.dateRange);
    }
    setMounted(true);
  }, []);

  // Write to URL on state change (debounced)
  React.useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedIds.length > 0)
        params.set("indicators", selectedIds.join(","));
      params.set("mode", valueMode);
      params.set("start", dateRange.startDate);
      params.set("end", dateRange.endDate);
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        qs ? `?${qs}` : window.location.pathname
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedIds, valueMode, dateRange, mounted]);

  // SWR fetcher
  const fetcher = React.useCallback(
    async ([ids, start, end]: [string[], string, string]) => {
      setLoadingIds(new Set(ids));
      setFetchErrors(new Map());
      try {
        const data = await fetchEconomicData(ids, start, end);
        return data;
      } finally {
        setLoadingIds(new Set());
      }
    },
    []
  );

  const swrKey = mounted && selectedIds.length > 0
    ? (`economic-data-${selectedIds.join(",")}-${dateRange.startDate}-${dateRange.endDate}` as const)
    : null;

  const { data: allData = [], isLoading } = useSWR<TimeSeriesData[]>(
    swrKey,
    () => fetcher([selectedIds, dateRange.startDate, dateRange.endDate]),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const chartData = React.useMemo(
    () => processDataForChart(allData, valueMode),
    [allData, valueMode]
  );

  const stats = React.useMemo(() => calculateStats(allData), [allData]);

  const selectedIndicators = React.useMemo(
    () =>
      indicators
        .filter((i) => selectedIds.includes(i.id))
        .map((ind, index) => ({
          id: ind.id,
          name: ind.country
            ? `${ind.name} (${t(`country_${ind.country}`)})`
            : ind.name,
          color: CHART_COLORS[index % CHART_COLORS.length],
        })),
    [selectedIds, t]
  );

  const dismissError = (id: string) => {
    setFetchErrors((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("appTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("appSubtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {t("dataSource")}
            </span>
            <ExportButton data={chartData} indicators={selectedIndicators} />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <IndicatorSelector
              indicators={indicators}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              loadingIds={loadingIds}
              errors={fetchErrors}
            />
          </div>
          <DatePickerRange value={dateRange} onChange={setDateRange} />
        </div>

        <div className="flex justify-end">
          <ValueModeSelector value={valueMode} onChange={setValueMode} />
        </div>

        {fetchErrors.size > 0 && (
          <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-yellow-500 font-medium">
              <AlertTriangle className="h-4 w-4" />
              <span>Some indicators failed to load:</span>
            </div>
            {Array.from(fetchErrors.entries()).map(([id, msg]) => (
              <div
                key={id}
                className="flex items-center gap-2 text-sm text-yellow-500/80 pl-6"
              >
                <span>
                  {indicators.find((i) => i.id === id)?.name}: {msg}
                </span>
                <button
                  onClick={() => dismissError(id)}
                  className="ml-auto hover:text-yellow-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && stats.length > 0 && <StatsCards stats={stats} />}

        {!isLoading && (
          <DataChart
            data={chartData}
            indicators={selectedIndicators}
            valueMode={valueMode}
            title={
              selectedIds.length > 0
                ? selectedIndicators.map((i) => i.name).join(" vs ")
                : t("timeSeriesData")
            }
          />
        )}
      </main>
    </div>
  );
}
