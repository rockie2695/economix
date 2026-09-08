/**
 * types/index.ts — Core type definitions for the Economix dashboard.
 *
 * These types define the shape of data flowing through the application:
 * - Indicator: metadata about available data sources
 * - DataPoint: a single date-value pair from the API
 * - TimeSeriesData: a collection of DataPoints for one indicator
 * - ChartDataPoint: processed data for Recharts (multiple indicators merged by date)
 * - StatsData: computed statistics for one indicator
 * - ValueMode: how to transform values for display
 * - DateRange: start and end dates for API queries
 */

/** Metadata for a data indicator (FRED series or DBnomics dataset) */
export interface Indicator {
  /** Unique identifier, e.g. "gdp", "oil_wti" */
  id: string;
  /** Display name, e.g. "GDP", "WTI Crude Oil" */
  name: string;
  /** i18n key for translated name, e.g. "gdp" — falls back to `name` if absent */
  nameKey?: string;
  /** Data source: "fred" requires API key, "dbnomics" is free, "worldbank" is open */
  source: "fred" | "dbnomics" | "worldbank";
  /** FRED series ID (required if source is "fred") */
  seriesId?: string;
  /** DBnomics dataset code (required if source is "dbnomics") */
  datasetCode?: string;
  /** DBnomics provider code, e.g. "FRED", "IMF" */
  providerCode?: string;
  /** Display unit, e.g. "Billions of Dollars", "Percent" */
  unit?: string;
  /** Category for grouping, e.g. "National Accounts", "Commodities" */
  category: string;
  /** Human-readable description */
  description?: string;
  /** Whether this is country-specific or global data */
  categoryType: "country" | "global";
  /** Country name key (e.g. "US", "EuroArea", "Japan", "China", "UK") — undefined for global */
  country?: string;
  /** Currency code for non-USD indicators (e.g. "EUR", "JPY", "GBP") — enables USD conversion */
  currency?: string;
  /** FRED series ID for exchange rate (e.g. "DEXUSEU" for EUR/USD) — used with currency */
  exchangeRateSeriesId?: string;
  /** World Bank ISO2 country code (e.g. "US", "JP", "CN") — used for World Bank API queries */
  countryCode?: string;
}

/** A single data point from the API (date + value pair) */
export interface DataPoint {
  /** ISO date string, e.g. "2024-01-15" */
  date: string;
  /** Numerical value */
  value: number;
}

/** Time series data for one indicator, returned by API routes */
export interface TimeSeriesData {
  /** Indicator ID this data belongs to */
  indicatorId: string;
  /** Display name for chart labels */
  indicatorName: string;
  /** Unit string for display */
  unit: string;
  /** Array of date-value pairs */
  data: DataPoint[];
}

/**
 * How to transform raw values for chart display.
 *
 * - "value": raw numerical values (default)
 * - "valueChange": absolute change from previous data point
 * - "percentage": percentage change from previous data point
 * - "percentageChange": alias for percentage
 */
export type ValueMode = "value" | "valueChange" | "percentage" | "percentageChange";

/** Date range for API queries (ISO date strings) */
export interface DateRange {
  /** Start date, e.g. "2020-01-01" */
  startDate: string;
  /** End date, e.g. "2024-12-31" */
  endDate: string;
}

/**
 * Processed data point for Recharts.
 *
 * Multiple indicators are merged by date:
 * { date: "2024-01-01", gdp: 28000, unemployment: 3.7 }
 *
 * The dynamic keys are indicator IDs with transformed values.
 */
export interface ChartDataPoint {
  /** ISO date string */
  date: string;
  /** Dynamic keys: indicator ID → display value */
  [indicatorId: string]: string | number | null;
}

/** Computed statistics for one indicator's time series */
export interface StatsData {
  /** Indicator ID */
  indicatorId: string;
  /** Display name */
  indicatorName: string;
  /** Most recent value */
  currentValue: number;
  /** Second-to-last value (null if only one data point) */
  previousValue: number | null;
  /** Absolute change: current - previous */
  change: number;
  /** Percentage change: (change / previous) * 100 */
  changePercent: number;
  /** Minimum value across all data points */
  min: number;
  /** Maximum value across all data points */
  max: number;
  /** Unit string for display */
  unit: string;
  /** Country or category key for display */
  countryOrCategoryKey: string;
}
