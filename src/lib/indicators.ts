/**
 * indicators.ts — Indicator definitions for the Economix dashboard.
 *
 * This file is the single source of truth for all available data indicators.
 * To add a new indicator, simply add an entry to the `indicators` array.
 * No other code changes are needed — the dashboard auto-discovers indicators.
 *
 * Each indicator maps to either:
 * - A FRED series (requires series_id + API key)
 * - A DBnomics dataset (requires dataset_code + provider_code, no key needed)
 *
 * @see types/index.ts for the Indicator interface
 * @see README.md for the full list of indicators
 */

import type { Indicator } from "@/types";

export const indicators: Indicator[] = [
  // ─── FRED Indicators ──────────────────────────────────────────────────────
  // These require a FRED API key in .env.local

  {
    id: "gdp",
    name: "GDP",
    source: "fred",
    seriesId: "GDP",
    unit: "Billions of Dollars",
    category: "National Accounts",
    description: "Gross Domestic Product",
  },
  {
    id: "unemployment",
    name: "Unemployment Rate",
    source: "fred",
    seriesId: "UNRATE",
    unit: "Percent",
    category: "Labor",
    description: "Civilian Unemployment Rate",
  },
  {
    id: "cpi",
    name: "CPI",
    source: "fred",
    seriesId: "CPIAUCSL",
    unit: "Index 1982-1984=100",
    category: "Prices",
    description: "Consumer Price Index for All Urban Consumers",
  },
  {
    id: "fed_funds_rate",
    name: "Federal Funds Rate",
    source: "fred",
    seriesId: "FEDFUNDS",
    unit: "Percent",
    category: "Interest Rates",
    description: "Federal Funds Effective Rate",
  },
  {
    id: "treasury_10y",
    name: "10-Year Treasury Rate",
    source: "fred",
    seriesId: "DGS10",
    unit: "Percent",
    category: "Interest Rates",
    description: "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity",
  },
  {
    id: "sp500",
    name: "S&P 500",
    source: "fred",
    seriesId: "SP500",
    unit: "Index",
    category: "Stock Market",
    description: "S&P 500 Index",
  },
  {
    id: "industrial_production",
    name: "Industrial Production",
    source: "fred",
    seriesId: "INDPRO",
    unit: "Index 2017=100",
    category: "Production",
    description: "Industrial Production: Total Index",
  },
  {
    id: "housing_starts",
    name: "Housing Starts",
    source: "fred",
    seriesId: "HOUST",
    unit: "Thousands of Units",
    category: "Housing",
    description: "New Privately-Owned Housing Units Started",
  },
  {
    id: "consumer_sentiment",
    name: "Consumer Sentiment",
    source: "fred",
    seriesId: "UMCSENT",
    unit: "Index 1966Q1=100",
    category: "Sentiment",
    description: "University of Michigan: Consumer Sentiment",
  },
  {
    id: "pce",
    name: "PCE",
    source: "fred",
    seriesId: "PCE",
    unit: "Billions of Dollars",
    category: "National Accounts",
    description: "Personal Consumption Expenditures",
  },

  // ─── DBnomics Indicators ──────────────────────────────────────────────────
  // These are free and do not require an API key

  {
    id: "oil_wti",
    name: "WTI Crude Oil",
    source: "dbnomics",
    datasetCode: "WFIVERDB-5",
    providerCode: "FRED",
    unit: "Dollars per Barrel",
    category: "Commodities",
    description: "Crude Oil WTI - Daily",
  },
  {
    id: "gold_price",
    name: "Gold Price",
    source: "dbnomics",
    datasetCode: "GFDEGDQ188S",
    providerCode: "FRED",
    unit: "US Dollars",
    category: "Commodities",
    description: "Gold Price",
  },
  {
    id: "sugar_global",
    name: "Global Sugar Price",
    source: "dbnomics",
    datasetCode: "PSUGA_USD",
    providerCode: "IMF",
    unit: "USD per pound",
    category: "Commodities",
    description: "Sugar, Global Price",
  },
  {
    id: "natural_gas",
    name: "Natural Gas Price",
    source: "dbnomics",
    datasetCode: "DHHNGSP",
    providerCode: "FRED",
    unit: "Dollars per Million BTU",
    category: "Commodities",
    description: "Henry Hub Natural Gas Spot Price",
  },
  {
    id: "trade_balance",
    name: "Trade Balance",
    source: "fred",
    seriesId: "BOPGSTB",
    unit: "Millions of Dollars",
    category: "Trade",
    description: "Trade Balance: Goods and Services, Balance of Payments Basis",
  },
  {
    id: "retail_sales",
    name: "Retail Sales",
    source: "fred",
    seriesId: "RSAFS",
    unit: "Millions of Dollars",
    category: "Consumption",
    description: "Advance Retail Sales: Retail Trade",
  },
];

/**
 * Unique categories derived from indicators.
 * Used for potential category filtering in the UI.
 */
export const categories = [...new Set(indicators.map((i) => i.category))];
