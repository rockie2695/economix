"use client";

import * as React from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { IndicatorSelector } from "./IndicatorSelector";
import { DatePickerRange } from "./DatePickerRange";
import { ValueModeSelector } from "./ValueModeSelector";
import { DataChart } from "./DataChart";
import { StatsCards } from "./StatsCards";
import { CorrelationMatrix } from "./CorrelationMatrix";
import { ScatterPlot } from "./ScatterPlot";
import { DataTable } from "./DataTable";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ExportButton } from "./ExportButton";
import { USDConvertToggle } from "./USDConvertToggle";
import { indicators } from "@/lib/indicators";
import { CHART_COLORS } from "@/lib/constants";
import { useLocale } from "@/lib/LocaleContext";
import { forecast } from "@/lib/forecast";
import type {
  TimeSeriesData,
  ChartDataPoint,
  ValueMode,
  DateRange,
  StatsData,
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
        case "yoyGrowth": {
          // Year-over-year: compare with same period last year
          // Find the data point approximately 1 year ago (365 days)
          const currentDate = new Date(point.date);
          const yearAgoDate = new Date(currentDate);
          yearAgoDate.setFullYear(yearAgoDate.getFullYear() - 1);
          const yearAgoStr = yearAgoDate.toISOString().split("T")[0];

          // Find closest data point to 1 year ago
          let yearAgoValue: number | null = null;
          let minDiff = Infinity;
          for (let j = 0; j < series.data.length; j++) {
            const diff = Math.abs(
              new Date(series.data[j].date).getTime() - yearAgoDate.getTime()
            );
            if (diff < minDiff) {
              minDiff = diff;
              yearAgoValue = series.data[j].value;
            }
          }

          displayValue =
            yearAgoValue !== null && yearAgoValue !== 0
              ? ((point.value - yearAgoValue) / yearAgoValue) * 100
              : 0;
          break;
        }
        default:
          displayValue = point.value;
      }

      const existing = dateMap.get(point.date);
      if (existing) {
        dateMap.set(point.date, { ...existing, [series.indicatorId]: displayValue });
      } else {
        dateMap.set(point.date, {
          date: point.date,
          [series.indicatorId]: displayValue,
        } as ChartDataPoint);
      }
    });
  });

  const allIndicatorIds = allData.map((s) => s.indicatorId);

  return Array.from(dateMap.values())
    .map((entry) => {
      const fixedEntry = { ...entry };
      allIndicatorIds.forEach((id) => {
        if (!(id in fixedEntry)) {
          fixedEntry[id] = null;
        }
      });
      return fixedEntry as ChartDataPoint;
    })
    .sort((a, b) =>
      (a.date as string).localeCompare(b.date as string)
    );
}

export function calculateStats(allData: TimeSeriesData[]): StatsData[] {
  return allData.map((series) => {
    const values = series.data.map((d) => d.value);
    const currentValue = values[values.length - 1] || 0;
    const previousValue = values.length > 1 ? values[values.length - 2] : null;
    const change = previousValue !== null ? currentValue - previousValue : 0;
    const changePercent =
      previousValue !== null && previousValue !== 0
        ? (change / previousValue) * 100
        : 0;

    // Get country/category key from the indicator definition
    const indicator = indicators.find((i) => i.id === series.indicatorId);
    let countryOrCategoryKey = "";
    if (indicator) {
      if (indicator.categoryType === "country") {
        countryOrCategoryKey = indicator.country
          ? `country_${indicator.country}`
          : "country_Other";
      } else {
        countryOrCategoryKey = indicator.category;
      }
    }

    return {
      indicatorId: series.indicatorId,
      indicatorName: series.indicatorName,
      currentValue,
      previousValue,
      change,
      changePercent,
      min: values.reduce((a, b) => Math.min(a, b), Infinity),
      max: values.reduce((a, b) => Math.max(a, b), -Infinity),
      unit: series.unit,
      countryOrCategoryKey,
    };
  });
}

// Scale factors for FRED indicators to convert raw API values to display values.
// After simplifying unit strings (e.g. "Billions of Dollars" → "Dollars"),
// we need to multiply the raw values by the appropriate factor for correct display.
export function getScaleFactor(unit: string, indicatorId: string): number {
  switch (unit) {
    case "Dollars":
      // trade_balance and retail_sales were "Millions of Dollars"
      if (indicatorId === "trade_balance" || indicatorId === "retail_sales") {
        return 1e6;
      }
      // All other "Dollars" indicators were "Billions of Dollars"
      return 1e9;
    case "Euros":
      return 1e6; // was "Millions of Chained 2010 Euros"
    case "Yen":
      return 1e9; // was "Billions of Chained 2015 Yen"
    case "Pounds":
      return 1e6; // was "Millions of Pounds"
    case "Domestic Currency":
      return 1e6; // was "Millions of Domestic Currency"
    case "Thousands of Units":
      return 1e3; // was "Thousands of Units"
    default:
      return 1;
  }
}

async function fetchEconomicData(
  ids: string[],
  startDate: string,
  endDate: string,
  locale: string = "en"
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
          locale,
        });
        url = `/api/fred?${params.toString()}`;
      } else if (indicator.source === "dbnomics") {
        const params = new URLSearchParams({
          dataset_code: indicator.datasetCode!,
          provider_code: indicator.providerCode!,
          start_date: startDate,
          end_date: endDate,
          locale,
        });
        url = `/api/dbnomics?${params.toString()}`;
      } else if (indicator.source === "worldbank") {
        // World Bank API - pass indicator ID and country code
        const params = new URLSearchParams({
          indicator: indicator.seriesId!,
          country: indicator.countryCode || "US",
          date: `${startDate}:${endDate}`,
          locale,
        });
        url = `/api/worldbank?${params.toString()}`;
      } else {
        throw new Error(`Unknown source: ${indicator.source}`);
      }

      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch data");
      }

      const result = await response.json();
      const scaleFactor =
        indicator.source === "fred"
          ? getScaleFactor(indicator.unit || "", id)
          : 1;
      return {
        indicatorId: id,
        indicatorName: indicator.name,
        unit: indicator.unit || "",
        data: result.observations
          ? result.observations.map((obs: { date: string; value: number }) => ({
              date: obs.date,
              value: obs.value * scaleFactor,
            })).filter((p: { date: string; value: number }) => !Number.isNaN(p.value))
          : [],
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

export function readStateFromURL() {
  return getInitialUrlState();
}

function getDefaultDateRange(): DateRange {
  const now = new Date();
  const start = new Date(now);
  start.setFullYear(start.getFullYear() - 1);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: now.toISOString().split("T")[0],
  };
}

function getInitialUrlState() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const ids = params.get("indicators")?.split(",").filter(Boolean) ?? [];
  const ids2 = params.get("indicators2")?.split(",").filter(Boolean) ?? [];
  const mode = params.get("mode") as ValueMode | null;
  const start = params.get("start");
  const end = params.get("end");
  const usd = params.get("usd") === "1";
  if (ids.length === 0 && ids2.length === 0 && !mode && !start && !end && !usd) return null;
  return {
    selectedIds: ids,
    selectedIds2: ids2,
    valueMode: (mode && ["value", "valueChange", "percentage", "percentageChange", "yoyGrowth"].includes(mode)
      ? mode
      : null) as ValueMode | null,
    dateRange: start && end ? { startDate: start, endDate: end } : null,
    convertToUSD: usd,
  };
}

function getIndicatorDisplayName(
  indicator: { name: string; nameKey?: string; country?: string } | undefined,
  t: (key: string) => string,
  convertToUSD?: boolean,
  unit?: string
): string {
  if (!indicator) return "";
  const baseName = indicator.nameKey
    ? t(indicator.nameKey)
    : indicator.name;
  const countryPart = indicator.country
    ? ` (${t(`country_${indicator.country}`)})`
    : "";
  const usdPart = convertToUSD && unit?.startsWith("USD") ? " (USD)" : "";
  return `${baseName}${countryPart}${usdPart}`;
}

export function Dashboard() {
  const { t, locale } = useLocale();

  const [urlState] = React.useState(getInitialUrlState);

  const [selectedIds, setSelectedIds] = React.useState<string[]>(
    urlState?.selectedIds ?? []
  );
  const [selectedIds2, setSelectedIds2] = React.useState<string[]>(
    urlState?.selectedIds2 ?? []
  );
  const [valueMode, setValueMode] = React.useState<ValueMode>(
    urlState?.valueMode ?? "value"
  );
  const [dateRange, setDateRange] = React.useState<DateRange>(
    urlState?.dateRange ?? getDefaultDateRange()
  );
  const [fetchErrors, setFetchErrors] = React.useState<Map<string, string>>(
    new Map()
  );
  const [loadingIds, setLoadingIds] = React.useState<Set<string>>(new Set());
  const [convertToUSD, setConvertToUSD] = React.useState(
    urlState?.convertToUSD ?? false
  );
  const [showEvents, setShowEvents] = React.useState(false);
  const [showMovingAverage, setShowMovingAverage] = React.useState(false);
  const [showForecast, setShowForecast] = React.useState(false);
  const fetchGenerationRef = React.useRef(0);

  // Write to URL on state change (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (selectedIds.length > 0)
        params.set("indicators", selectedIds.join(","));
      if (selectedIds2.length > 0)
        params.set("indicators2", selectedIds2.join(","));
      params.set("mode", valueMode);
      params.set("start", dateRange.startDate);
      params.set("end", dateRange.endDate);
      if (convertToUSD) params.set("usd", "1");
      const qs = params.toString();
      window.history.replaceState(
        null,
        "",
        qs ? `?${qs}` : window.location.pathname
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedIds, selectedIds2, valueMode, dateRange, convertToUSD]);

  // SWR fetcher
  const fetcher = React.useCallback(
    async ([ids, start, end]: [string[], string, string]) => {
      const gen = ++fetchGenerationRef.current;
      setLoadingIds(new Set(ids));
      setFetchErrors(new Map());
      try {
        const data = await fetchEconomicData(ids, start, end, locale);
        return data;
      } finally {
        if (fetchGenerationRef.current === gen) {
          setLoadingIds(new Set());
        }
      }
    },
    [locale]
  );

  // Merge both sets of selected IDs for a single fetch
  const allSelectedIds = React.useMemo(
    () => Array.from(new Set([...selectedIds, ...selectedIds2])),
    [selectedIds, selectedIds2]
  );

  const swrKey = allSelectedIds.length > 0
    ? (`economic-data-${allSelectedIds.join(",")}-${dateRange.startDate}-${dateRange.endDate}` as const)
    : null;

  const { data: allData = [], isLoading } = useSWR<TimeSeriesData[]>(
    swrKey,
    () => fetcher([allSelectedIds, dateRange.startDate, dateRange.endDate]),
    {
      revalidateOnFocus: false,
      dedupingInterval: 0,
    }
  );

  // Fetch exchange rates for USD conversion
  const exchangeRateSeriesIds = React.useMemo(() => {
    if (!convertToUSD) return [];
    const ids = new Set<string>();
    selectedIds.forEach((id) => {
      const indicator = indicators.find((i) => i.id === id);
      // FRED indicators with exchange rate series
      if (indicator?.exchangeRateSeriesId) {
        ids.add(indicator.exchangeRateSeriesId);
      }
      // World Bank indicators (source: dbnomics) - convert EUR to USD
      if (indicator?.source === "dbnomics" && indicator.currency) {
        ids.add(indicator.currency);
      }
    });
    selectedIds2.forEach((id) => {
      const indicator = indicators.find((i) => i.id === id);
      if (indicator?.exchangeRateSeriesId) {
        ids.add(indicator.exchangeRateSeriesId);
      }
      if (indicator?.source === "dbnomics" && indicator.currency) {
        ids.add(indicator.currency);
      }
    });
    return Array.from(ids);
  }, [selectedIds, selectedIds2, convertToUSD]);

  const exchangeRateKey =
    exchangeRateSeriesIds.length > 0
      ? `exchange-rates-${exchangeRateSeriesIds.join(",")}`
      : null;

  const { data: exchangeRates } = useSWR<Record<string, number>>(
    exchangeRateKey,
    async () => {
      if (!exchangeRateSeriesIds.length) return {};
      const params = new URLSearchParams({
        series_ids: exchangeRateSeriesIds.join(","),
      });
      const response = await fetch(`/api/exchange-rate?${params.toString()}`);
      if (!response.ok) return {};
      const result = await response.json();
      return result.rates || {};
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour cache
    }
  );

// Convert data to USD when enabled
  const convertedData = React.useMemo(() => {
    if (!convertToUSD || !exchangeRates || Object.keys(exchangeRates).length === 0) {
      return allData;
    }

    return allData.map((series) => {
      const indicator = indicators.find((i) => i.id === series.indicatorId);
      // FRED indicators with exchange rate series
      if (indicator?.exchangeRateSeriesId && indicator.currency) {
        const rate = exchangeRates[indicator.exchangeRateSeriesId];
        if (!rate || rate === 0) return series;

        return {
          ...series,
          unit: "USD",  // Standardized unit for comparison
          data: series.data.map((point) => ({
            ...point,
            value: point.value / rate,
          }))
        };
      }
      // World Bank indicators (source: dbnomics) - convert EUR to USD
      if (indicator?.source === "dbnomics" && indicator.currency) {
        const rate = exchangeRates[indicator.currency];
        if (!rate || rate === 0) return series;

        return {
          ...series,
          unit: "USD",  // Standardized unit for comparison
          data: series.data.map((point) => ({
            ...point,
            value: point.value / rate,
          }))
        };
      }
      return series; // Already USD or no conversion needed
    });
  }, [allData, convertToUSD, exchangeRates]);

  const chartData = React.useMemo(
    () => processDataForChart(convertedData, valueMode),
    [convertedData, valueMode]
  );

  const stats = React.useMemo(() => calculateStats(convertedData), [convertedData]);

  const stats2 = React.useMemo(() => {
    return calculateStats(convertedData).filter((s) => selectedIds2.includes(s.indicatorId));
  }, [convertedData, selectedIds2]);

  const leftStats = React.useMemo(
    () => stats.filter((s) => !selectedIds2.includes(s.indicatorId)),
    [stats, selectedIds2]
  );

  // Compute forecast data (8 periods ahead)
  const forecastChartData = React.useMemo(() => {
    if (!showForecast || chartData.length < 4) return [];
    const allIds = [...selectedIds, ...selectedIds2];
    const result: ChartDataPoint[] = [];
    const lastDate = chartData[chartData.length - 1]?.date;

    // For each indicator, compute forecast
    for (const id of allIds) {
      const values = chartData
        .map((d) => d[id] as number)
        .filter((v) => v != null && !Number.isNaN(v));
      if (values.length < 4) continue;
      const forecasted = forecast(values, 8);

      // Create future data points
      const lastDateObj = new Date(lastDate as string);
      for (let i = values.length; i < forecasted.length; i++) {
        const futureDate = new Date(lastDateObj);
        futureDate.setMonth(futureDate.getMonth() + (i - values.length + 1));
        const dateStr = futureDate.toISOString().split("T")[0];
        const existing = result.find((r) => r.date === dateStr);
        if (existing) {
          existing[`forecast_${id}`] = forecasted[i];
        } else {
          result.push({
            date: dateStr,
            [`forecast_${id}`]: forecasted[i],
          } as ChartDataPoint);
        }
      }
    }
    return result;
  }, [showForecast, chartData, selectedIds, selectedIds2]);

  const selectedIndicators = React.useMemo(
    () =>
      convertedData
        .filter((i) => selectedIds.includes(i.indicatorId))
        .map((series, index) => {
          const indicator = indicators.find((i) => i.id === series.indicatorId);
          const displayName = getIndicatorDisplayName(
            indicator, t, convertToUSD, series.unit
          ) || series.indicatorName;
          return {
            id: series.indicatorId,
            name: displayName,
            color: CHART_COLORS[index % CHART_COLORS.length],
          };
        }),
    [selectedIds, convertedData, convertToUSD, t]
  );

  const selectedIndicators2 = React.useMemo(
    () =>
      convertedData
        .filter((i) => selectedIds2.includes(i.indicatorId))
        .map((series, index) => {
          const indicator = indicators.find((i) => i.id === series.indicatorId);
          const displayName = getIndicatorDisplayName(
            indicator, t, convertToUSD, series.unit
          ) || series.indicatorName;
          return {
            id: series.indicatorId,
            name: displayName,
            color: CHART_COLORS[(selectedIds.length + index) % CHART_COLORS.length],
          };
        }),
    [selectedIds, selectedIds2, convertedData, convertToUSD, t]
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
            <USDConvertToggle
              enabled={convertToUSD}
              onToggle={() => setConvertToUSD(!convertToUSD)}
              visible={[...selectedIds, ...selectedIds2].some((id) => {
                const ind = indicators.find((i) => i.id === id);
                return ind?.currency;
              })}
            />
            <ExportButton data={chartData} indicators={selectedIndicators} />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
<div className="flex-1">
              <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("leftAxis")}</div>
              <IndicatorSelector
                indicators={indicators}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                loadingIds={loadingIds}
                errors={fetchErrors}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="mt-2"
              >
                {t("reset")}
              </Button>
            </div>
            <div className="flex-1">
              <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("rightAxis")}</div>
              <IndicatorSelector
                indicators={indicators}
                selectedIds={selectedIds2}
                onSelectionChange={setSelectedIds2}
                loadingIds={loadingIds}
                errors={fetchErrors}
                placeholder={t("selectRightAxisIndicators")}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds2([])}
                className="mt-2"
              >
                {t("reset")}
              </Button>
            </div>
          <DatePickerRange value={dateRange} onChange={setDateRange} />
        </div>

        <div className="flex justify-end">
          <ValueModeSelector value={valueMode} onChange={setValueMode} />
        </div>

        {/* Chart enhancement toggles */}
        {chartData.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showEvents ? "default" : "outline"}
              size="sm"
              onClick={() => setShowEvents(!showEvents)}
              className="text-xs"
            >
              {t("showEvents")}
            </Button>
            <Button
              variant={showMovingAverage ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMovingAverage(!showMovingAverage)}
              className="text-xs"
            >
              {t("showMovingAverage")}
            </Button>
            <Button
              variant={showForecast ? "default" : "outline"}
              size="sm"
              onClick={() => setShowForecast(!showForecast)}
              className="text-xs"
            >
              {t("showForecast")}
            </Button>
          </div>
        )}

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
          <div className="h-[300px] sm:h-[350px] lg:h-[400px] rounded-lg bg-muted animate-pulse" />
        )}

{!isLoading && leftStats.length > 0 && <StatsCards stats={leftStats} />}
{!isLoading && stats2.length > 0 && <StatsCards stats={stats2} />}

        {!isLoading && (
          <div className="space-y-4">
            <DataChart
              data={chartData}
              indicators={selectedIndicators}
              rightIndicators={selectedIndicators2}
              valueMode={valueMode}
              title={
                selectedIds.length > 0
                  ? selectedIndicators.map((i) => i.name).join(" vs ")
                  : t("timeSeriesData")
              }
              showEvents={showEvents}
              showMovingAverage={showMovingAverage}
              movingAverageWindow={3}
              forecastData={forecastChartData.length > 0 ? forecastChartData : undefined}
            />
            {chartData.length > 0 &&
              (selectedIndicators.length + selectedIndicators2.length >= 2) && (
                <CorrelationMatrix
                  data={chartData}
                  indicators={selectedIndicators}
                  rightIndicators={selectedIndicators2}
                />
              )}
            {chartData.length > 0 &&
              (selectedIndicators.length + selectedIndicators2.length >= 2) && (
                <ScatterPlot
                  data={chartData}
                  indicators={selectedIndicators}
                  rightIndicators={selectedIndicators2}
                  valueMode={valueMode}
                />
              )}
            {chartData.length > 0 &&
              (selectedIndicators.length + selectedIndicators2.length > 0) && (
                <DataTable
                  data={chartData}
                  indicators={selectedIndicators}
                  rightIndicators={selectedIndicators2}
                  valueMode={valueMode}
                />
              )}
          </div>
        )}
       </main>
    </div>
  );
}
