# Economix — Economic Data Dashboard

A modern dashboard for visualizing macroeconomic data from **FRED**, **DBnomics**, and **World Bank** APIs. Built with Next.js App Router, TypeScript, Tailwind CSS, Recharts, and React Compiler. Supports **繁中/English** language switching and dark/light themes.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting an API Key](#getting-an-api-key)
- [Environment Variables](#environment-variables)
- [Available Indicators](#available-indicators)
- [Architecture](#architecture)
- [API Routes](#api-routes)
- [Components](#components)
- [Internationalization](#internationalization)
- [Adding New Indicators](#adding-new-indicators)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your FRED API key

# 3. Run the dev server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

---

## Features

- **Multi-indicator comparison** — Select one or more indicators to overlay on the same chart
- **Dual Y-axis** — Compare indicators with different scales using left and right Y-axes
- **10 countries + global** — US, Euro Area, Japan, China, UK, India, Brazil, South Korea, Canada, Australia + global commodities & recession risk
- **Country-specific grouping** — Indicators organized by country and global categories
- **Searchable indicator picker** — Filter by name, category, or description with per-indicator loading/error states
- **Date range control** — Custom date pickers + quick presets (1Y, 5Y, 10Y, All)
- **4 display modes** — Raw value, value change, percentage, cumulative percentage change
- **5 display modes** — Raw value, value change, percentage, cumulative percentage change, year-over-year growth
- **Correlation analysis** — Pearson correlation matrix showing relationships between selected indicators
- **Scatter plot** — Visualize correlation between two indicators as a scatter plot with r-value
- **Historical events overlay** — Mark recessions, crises, and major events on the chart timeline
- **Moving average trend line** — Optional 3-period moving average overlay to smooth noisy data
- **Forecast** — Linear regression extrapolation 8 periods into the future (dashed line)
- **Data table** — Tabular view of raw chart data with pagination
- **Mode tooltips** — Hover over display mode buttons to see what each mode shows
- **Interactive tooltips** — Hover over chart lines to see exact values
- **Stats cards** — Current value, change %, and trend arrows at a glance
- **i18n support** — Switch between 繁中 and English with one click
- **Dark/light theme** — Toggle between themes, persisted to localStorage
- **Export to CSV** — One-click download of chart data
- **URL state persistence** — Shareable links with selected indicators, dates, and display mode
- **Recession risk indicators** — Yield curve (10Y-2Y, 10Y-3M) and Leading Economic Index
- **Resilient fetching** — Promise.allSettled with per-indicator error handling
- **React Compiler** — Automatic memoization via babel-plugin-react-compiler
- **Responsive** — Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui (Base UI) |
| Charts | Recharts 3 |
| Icons | Lucide React |
| State | SWR + React hooks |
| i18n | React Context + localStorage |
| Theme | React Context + localStorage |
| Testing | Vitest |
| Compiler | React Compiler (babel-plugin-react-compiler) |
| Data Sources | FRED API, DBnomics API, World Bank API |

---

## Project Structure

```
economix/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── fred/route.ts         # FRED API proxy
│   │   │   ├── dbnomics/route.ts     # DBnomics API proxy
│   │   │   ├── worldbank/route.ts    # World Bank API proxy
│   │   │   └── exchange-rate/route.ts # Exchange rate API
│   │   ├── layout.tsx                # Root layout (theme)
│   │   ├── page.tsx                  # Entry point → Dashboard
│   │   └── globals.css               # Tailwind + shadcn tokens
│   ├── components/
│   │   ├── Dashboard.tsx             # Main orchestrator (SWR, URL state, Promise.allSettled)
│   │   ├── IndicatorSelector.tsx     # Searchable multi-select with loading/error UI
│   │   ├── DatePickerRange.tsx       # Date range + quick presets
│   │   ├── ValueModeSelector.tsx     # Value/Change/%/% Change toggle with tooltips
│   │   ├── DataChart.tsx             # Recharts LineChart (responsive height, dual Y-axis)
│   │   ├── StatsCards.tsx            # Stats display cards (theme-aware colors)
│   │   ├── CorrelationMatrix.tsx     # Correlation matrix
│   │   ├── LanguageSwitcher.tsx      # 繁中/EN toggle
│   │   ├── ThemeToggle.tsx           # Dark/light theme toggle
│   │   ├── ExportButton.tsx          # CSV export with proper escaping
│   │   ├── USDConvertToggle.tsx      # USD conversion toggle
│   │   ├── Providers.tsx             # Client-side context providers
│   │   └── ui/                       # shadcn/ui primitives
│   ├── lib/
│   │   ├── indicators.ts             # Indicator definitions (52 indicators, nameKey for i18n)
│   │   ├── i18n.ts                   # Translation dictionaries (en/zh-TW, 93 keys)
│   │   ├── api-errors.ts             # Locale-aware API error messages
│   │   ├── LocaleContext.tsx          # React Context for locale state
│   │   ├── ThemeContext.tsx           # React Context for theme state
│   │   ├── constants.ts              # Shared constants (CHART_COLORS)
│   │   ├── correlation.ts            # Pearson correlation computation
│   │   └── utils.ts                  # cn() helper
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   └── __tests__/
│       ├── i18n.test.ts              # Translation key parity tests
│       ├── indicators.test.ts        # Indicator structure validation
│       ├── chart-data.test.ts        # processDataForChart unit tests
│       ├── stats.test.ts             # calculateStats unit tests
│       ├── api-errors.test.ts        # API error message tests
│       └── url-state.test.ts         # URL state parsing tests
├── vitest.config.ts                  # Vitest configuration
├── .env.local                        # API keys (git-ignored)
└── package.json
```

---

## Getting an API Key

### FRED (Federal Reserve Economic Data)

1. Go to https://fred.stlouisfed.org/docs/api/api_key.html
2. Click "Request API Key"
3. Fill out the form (free, instant approval)
4. Copy your API key into `.env.local`

### DBnomics

No API key required — the API is free and open.

### World Bank

No API key required — the API is free and open.

---

## Environment Variables

Create `.env.local` in the project root:

```env
# FRED API Key (required for FRED indicators)
FRED_API_KEY=your_api_key_here

# DBnomics does not require an API key

# World Bank does not require an API key
```

---

## Available Indicators

### United States (FRED) — 12 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `gdp` | GDP | GDP | Billions of $ | National Accounts |
| `unemployment` | Unemployment Rate | UNRATE | % | Labor |
| `cpi` | CPI | CPIAUCSL | Index | Prices |
| `fed_funds_rate` | Federal Funds Rate | FEDFUNDS | % | Interest Rates |
| `treasury_10y` | 10-Year Treasury | DGS10 | % | Interest Rates |
| `sp500` | S&P 500 | SP500 | Index | Stock Market |
| `industrial_production` | Industrial Production | INDPRO | Index | Production |
| `housing_starts` | Housing Starts | HOUST | Thousands | Housing |
| `consumer_sentiment` | Consumer Sentiment | UMCSENT | Index | Sentiment |
| `pce` | PCE | PCE | Billions of $ | National Accounts |
| `trade_balance` | Trade Balance | BOPGSTB | Millions of $ | Trade |
| `retail_sales` | Retail Sales | RSAFS | Millions of $ | Consumption |

### Euro Area (FRED) — 4 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `eu_gdp` | GDP | CLVMNACSCAB1GQEA19 | Millions of Chained 2010 Euros | National Accounts |
| `eu_unemployment` | Unemployment Rate | LRHUTTTTEZM156S | % | Labor |
| `eu_hicp` | HICP | CP0000EZ19M086NEST | Index 2025=100 | Prices |
| `eu_ecb_rate` | ECB Main Refinancing Rate | ECBMRRFR | % | Interest Rates |

### Japan (FRED) — 4 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `jp_gdp` | GDP | JPNRGDPEXP | Billions of Chained 2015 Yen | National Accounts |
| `jp_unemployment` | Unemployment Rate | LRHUTTTTJPM156S | % | Labor |
| `jp_cpi` | CPI | CPALTT01JPM659N | Index 2015=100 | Prices |
| `jp_boj_rate` | BOJ Policy Rate | IRSTCI01JPM156N | % | Interest Rates |

### China (FRED) — 3 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `cn_gdp` | GDP | MKTGDPCNA646NWDB | Current US Dollars | National Accounts |
| `cn_cpi` | CPI | CPALTT01CNM659N | Index 2015=100 | Prices |
| `cn_interest_rate` | Interest Rate | INTDSRCNM193N | % per Annum | Interest Rates |

### United Kingdom (FRED) — 4 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `uk_gdp` | GDP | UKNGDP | Millions of Pounds | National Accounts |
| `uk_unemployment` | Unemployment Rate | LRHUTTTTGBM156S | % | Labor |
| `uk_cpi` | CPI | GBRCPIALLMINMEI | Index 2015=100 | Prices |
| `uk_boe_rate` | BOE Bank Rate | BOERUKM | % per Annum | Interest Rates |

### India (FRED) — 3 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `in_gdp` | GDP | MKTGDPIA646NWDB | Current US Dollars | National Accounts |
| `in_cpi` | CPI | CPALTT01INM659N | Index 2015=100 | Prices |
| `in_interest_rate` | Interest Rate | INTDSRINM193N | % per Annum | Interest Rates |

### Brazil (FRED) — 3 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `br_gdp` | GDP | MKTGDPBRA646NWDB | Current US Dollars | National Accounts |
| `br_cpi` | CPI | CPALTT01BRM659N | Index 2015=100 | Prices |
| `br_interest_rate` | Interest Rate | INTDSRBRM193N | % per Annum | Interest Rates |

### South Korea (FRED) — 3 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `kr_gdp` | GDP | MKTGDPKR646NWDB | Current US Dollars | National Accounts |
| `kr_cpi` | CPI | CPALTT01KRM659N | Index 2015=100 | Prices |
| `kr_interest_rate` | Interest Rate | INTDSRKR193N | % per Annum | Interest Rates |

### Canada (FRED) — 4 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `ca_gdp` | GDP | NGDPRDPCNADGP | Current US Dollars | National Accounts |
| `ca_unemployment` | Unemployment Rate | LRHUTTTTCAM156S | % | Labor |
| `ca_cpi` | CPI | CPALTT01CAM659N | Index 2015=100 | Prices |
| `ca_interest_rate` | Interest Rate | INTDSRCAM193N | % per Annum | Interest Rates |

### Australia (FRED) — 4 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `au_gdp` | GDP | MKTGDPAU646NWDB | Current US Dollars | National Accounts |
| `au_unemployment` | Unemployment Rate | LRHUTTTTAIM156S | % | Labor |
| `au_cpi` | CPI | CPALTT01AIM659N | Index 2015=100 | Prices |
| `au_interest_rate` | Interest Rate | INTDSRAIM193N | % per Annum | Interest Rates |

### Recession Risk / Forecast (FRED) — 3 indicators

| ID | Name | Series ID | Unit | Category |
|----|------|-----------|------|----------|
| `yield_curve_10y2y` | Yield Curve (10Y-2Y) | T10Y2Y | % | Recession Risk |
| `yield_curve_10y3m` | Yield Curve (10Y-3M) | T10Y3M | % | Recession Risk |
| `leading_index` | Leading Economic Index | USSLIND | Index 2016=100 | Recession Risk |

### Global / Commodities (DBnomics) — 4 indicators

| ID | Name | Dataset | Provider | Unit | Category |
|----|------|---------|----------|------|----------|
| `oil_wti` | WTI Crude Oil | WFIVERDB-5 | FRED | $/barrel | Commodities |
| `gold_price` | Gold Price | GFDEGDQ188S | FRED | USD | Commodities |
| `sugar_global` | Global Sugar | PSUGA_USD | IMF | USD/lb | Commodities |
| `natural_gas` | Natural Gas | DHHNGSP | FRED | $/MMBTU | Commodities |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Indicator    │  │   Date Range │  │  Value Mode  │  │
│  │  Selector     │  │   Picker     │  │  Selector    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            │                             │
│                    ┌───────▼───────┐                     │
│                    │   Dashboard   │  (SWR, URL state)   │
│                    │   (React)     │                     │
│                    └───────┬───────┘                     │
│                            │                             │
│              ┌─────────────┼─────────────┐               │
│              │             │             │               │
│        ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐         │
│        │  Stats    │ │  Data   │ │  Loading  │         │
│        │  Cards    │ │  Chart  │ │  / Error  │         │
│        └───────────┘ └─────────┘ └───────────┘         │
└──────────────────────────┬──────────────────────────────┘
                           │ fetch()
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  Next.js API Routes                       │
│                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  /api/fred      │  │  /api/dbnomics  │  │  /api/worldbank │  │
│  │  (proxy)        │  │  (proxy)        │  │  (proxy)        │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                     │           │
└───────────┼────────────────────┼─────────────────────┼───────────┘
            │                    │                     │
            ▼                    ▼                     ▼
    ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
    │  FRED API     │    │  DBnomics API │    │  World Bank   │
    │  (external)   │    │  (external)   │    │  API (external)│
    └───────────────┘    └───────────────┘    └───────────────┘
```

### Data Flow

1. User selects indicators → `Dashboard` updates `selectedIds` state + syncs to URL
2. `useSWR` triggers `fetchData()` when selection or date range changes
3. `fetchData` uses `Promise.allSettled()` for parallel fetches — individual failures don't block others
4. Per-indicator `loadingIds` and `fetchErrors` state for granular UI feedback
5. API routes proxy requests to external APIs, hiding API keys from the client
6. `useMemo` computes `chartData` and `stats` only when dependencies change
7. `DataChart` and `StatsCards` render the processed data

---

## API Routes

### `GET /api/fred`

Proxies requests to the FRED API.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `series_id` | string | Yes | FRED series ID (e.g., "GDP") |
| `start_date` | string | No | ISO date (default: 2000-01-01) |
| `end_date` | string | No | ISO date (default: today) |
| `locale` | string | No | `"en"` or `"zh-TW"` for localized error messages (default: "en") |

**Response:**

```json
{
  "series_id": "GDP",
  "observations": [
    { "date": "2000-01-01", "value": 10252.3 },
    { "date": "2000-04-01", "value": 10456.9 }
  ]
}
```

### `GET /api/dbnomics`

Proxies requests to the DBnomics API.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `dataset_code` | string | Yes | DBnomics dataset code |
| `provider_code` | string | Yes | Provider code (e.g., "FRED", "IMF") |
| `start_date` | string | No | ISO date |
| `end_date` | string | No | ISO date |
| `locale` | string | No | `"en"` or `"zh-TW"` for localized error messages (default: "en") |

**Response:**

```json
{
  "dataset_code": "WFIVERDB-5",
  "provider_code": "FRED",
  "observations": [
    { "date": "2024-01-02", "value": 72.34 },
    { "date": "2024-01-03", "value": 73.01 }
  ]
}
```

### `GET /api/worldbank`

Proxies requests to the World Bank API.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `indicator` | string | Yes | World Bank indicator code (e.g., "NY.GDP.MKTP.CD") |
| `country` | string | No | ISO2 country code (default: "US") |
| `date` | string | No | Date range (e.g., "2020:2024") |
| `locale` | string | No | `"en"` or `"zh-TW"` for localized error messages (default: "en") |

**Response:**

```json
{
  "indicator": "NY.GDP.MKTP.CD",
  "observations": [
    { "date": "2020-01-01", "value": 20894500000000 },
    { "date": "2021-01-01", "value": 23315000000000 }
  ]
}
```

---

## Components

### `Dashboard.tsx`

The main orchestrator. Manages state via SWR and URL persistence:
- `selectedIds: string[]` — Which indicators are selected for left Y-axis (synced to URL)
- `selectedIds2: string[]` — Which indicators are selected for right Y-axis (synced to URL)
- `valueMode: ValueMode` — How to display values (synced to URL)
- `dateRange: DateRange` — Start and end dates (synced to URL)
- `allData: TimeSeriesData[]` — Fetched data via Promise.allSettled
- `loadingIds: Set<string>` — Per-indicator loading state
- `fetchErrors: Map<string, string>` — Per-indicator error messages

Exports `processDataForChart()` and `calculateStats()` for testing.

### `IndicatorSelector.tsx`

A popover with a searchable list of indicators grouped by country and global categories. Supports:
- Multi-select with badge chips
- Click badges to remove
- Search by name, category, or description (searches both English and translated names)
- Per-indicator loading spinner and error badge
- Grouped layout: Country-specific → country → indicators, Global → category → indicators
- Translated indicator names via `getIndicatorName()` helper

### `DatePickerRange.tsx`

Date range input with quick-select buttons:
- Custom date inputs for start/end
- Preset buttons: 1Y, 5Y, 10Y, All

### `ValueModeSelector.tsx`

A segmented control with 4 display modes. Each button has a tooltip describing what it shows:

| Mode | Description | Tooltip |
|------|-------------|---------|
| **Value** | Raw numerical value | "Raw numerical value" |
| **Change** | Absolute change from previous data point | "Change from previous data point" |
| **%** | Percentage change from previous data point | "Percentage change from previous data point" |
| **% Change** | Cumulative net change from start of period | "Cumulative net change from start of period" |

### `DataChart.tsx`

A Recharts `LineChart` wrapper with:
- Responsive container (fills parent width)
- Responsive height: `h-[300px] sm:h-[350px] lg:h-[400px]`
- Custom dark/light themed tooltip
- Color-coded lines per indicator (shared CHART_COLORS)
- Grid lines matching the theme
- **Dual Y-axis support** — Compare indicators with different scales (left axis = solid lines, right axis = dashed lines)

### `StatsCards.tsx`

A grid of stat cards showing for each indicator:
- Current value with unit
- Change % from previous period
- Trend arrow (up/down/neutral)

### `LanguageSwitcher.tsx`

A toggle button in the header that switches between 繁中 and English. Locale is persisted to localStorage.

### `ThemeToggle.tsx`

A toggle button that switches between dark and light themes. Theme is persisted to localStorage and applied via CSS class on `<html>`.

### `ExportButton.tsx`

A button that exports the current chart data to CSV format. Properly escapes values containing commas or quotes. Downloads as `economix-YYYY-MM-DD.csv`.

### `CorrelationMatrix.tsx`

Displays pairwise Pearson correlation coefficients between all selected indicators. Shows:
- Correlation coefficient (r value) for each pair
- Relationship type (strong/moderate/weak positive/negative)
- Color-coded cards (green for positive, red for negative correlations)

### `ScatterPlot.tsx`

Plots the first two selected indicators against each other on an X-Y scatter plot. Includes:
- X-axis = first indicator, Y-axis = second indicator
- Correlation coefficient (r) shown in the title
- Responsive container with tooltips

### `DataTable.tsx`

Paginated tabular view of the raw chart data. Features:
- Most recent dates shown first
- Color-coded column headers matching chart line colors
- 20 rows per page with Previous/Next navigation

---

## Chart Enhancement Toggles

Three toggle buttons appear above the chart when data is loaded:

| Toggle | Effect |
|--------|--------|
| **Events** | Shows vertical dashed lines for historical events (recessions, crises, policy changes) |
| **Trend** | Adds a 3-period moving average line for each indicator (dashed, semi-transparent) |
| **Forecast** | Extrapolates each indicator 8 periods into the future using linear regression (dashed line) |

---

## Value Modes

| Mode | Formula | Description |
|------|---------|-------------|
| **Value** | raw value | Default — shows the actual numerical value |
| **Change** | `value[i] - value[i-1]` | Absolute change from previous data point |
| **%** | `((value[i] - value[i-1]) / value[i-1]) * 100` | Percentage change from previous |
| **% Change** | `((value[i] - value[0]) / value[0]) * 100` | Cumulative change from period start |
| **YoY** | `((value[i] - value[1yr_ago]) / value[1yr_ago]) * 100` | Year-over-year growth rate |

---

## Internationalization

The app supports two locales:
- **English** (`en`) — default
- **繁體中文** (`zh-TW`)

### How it works

- `src/lib/i18n.ts` — Translation dictionary with 93 keys (including indicator names like `gdp`, `unemployment`, `cpi`, etc.)
- `src/lib/LocaleContext.tsx` — React Context providing `locale`, `t()`, `setLocale()`
- `src/components/LanguageSwitcher.tsx` — Toggle button in header
- Locale is persisted to `localStorage("economix-locale")`

### Adding a new locale

1. Add locale type to `Locale` in `src/lib/i18n.ts`
2. Add translation entries for all keys in `translations`
3. Update `LocaleContext.tsx` to accept the new locale in `getInitialLocale()`

### Adding a new translation key

1. Add the key to `TranslationKey` type in `src/lib/i18n.ts`
2. Add translations for all locales in the `translations` object
3. Use `t("yourKey")` in components via `useLocale()`

---

## Adding New Indicators

### FRED Indicator

1. Find the series ID at https://fred.stlouisfed.org/
2. Add an entry to `src/lib/indicators.ts`:

```typescript
{
  id: "my_indicator",
  name: "My Indicator",
  source: "fred",
  seriesId: "SERIES_ID",
  unit: "Units",
  category: "nationalAccounts",
  description: "Description text",
  categoryType: "country",
  country: "US",  // or "EuroArea", "Japan", "China", "UK", "India", "Brazil", "SouthKorea", "Canada", "Australia"
}
```

### DBnomics Indicator

1. Find the dataset at https://db.nomics.world/
2. Add an entry to `src/lib/indicators.ts`:

```typescript
{
  id: "my_dataset",
  name: "My Dataset",
  source: "dbnomics",
  datasetCode: "DATASET_CODE",
  providerCode: "PROVIDER",
  unit: "Units",
  category: "commodities",
  description: "Description text",
  categoryType: "global",
}
```

### World Bank Indicator

1. Find the indicator at https://data.worldbank.org/
2. Add an entry to `src/lib/indicators.ts`:

```typescript
{
  id: "wb_indicator",
  name: "World Bank Indicator",
  source: "worldbank",
  seriesId: "INDICATOR_CODE",  // e.g., "NY.GDP.MKTP.CD"
  countryCode: "US",           // ISO2 country code
  unit: "Units",
  category: "nationalAccounts",
  description: "Description text",
  categoryType: "country",
  country: "US",
}
```

No other code changes needed — the dashboard auto-discovers indicators from the array.

---

## Testing

Tests use [Vitest](https://vitest.dev/) and cover core logic:

```bash
# Run all tests
npm test

# Run tests in watch mode
npx vitest
```

### Test files

| File | Coverage |
|------|----------|
| `src/__tests__/i18n.test.ts` | Translation key parity, `t()` correctness, new countries |
| `src/__tests__/indicators.test.ts` | Indicator structure, 10 countries, recession risk, 40+ total |
| `src/__tests__/chart-data.test.ts` | `processDataForChart()` — merge, sort, value modes |
| `src/__tests__/stats.test.ts` | `calculateStats()` — change, percentages, min/max |
| `src/__tests__/api-errors.test.ts` | API error messages, locale switching |
| `src/__tests__/url-state.test.ts` | `getScaleFactor()`, URL state parsing |

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add FRED_API_KEY
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Self-Hosted

```bash
npm run build
npm run start
```

---

## License

MIT
