# Economix — Economic Data Dashboard

A modern dashboard for visualizing macroeconomic data from **FRED** and **DBnomics** APIs. Built with Next.js App Router, TypeScript, Tailwind CSS, Recharts, and React Compiler. Supports **繁中/English** language switching and dark/light themes.

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
- **10 countries + global** — US, Euro Area, Japan, China, UK, India, Brazil, South Korea, Canada, Australia + global commodities & recession risk
- **Country-specific grouping** — Indicators organized by country and global categories
- **Searchable indicator picker** — Filter by name, category, or description with per-indicator loading/error states
- **Date range control** — Custom date pickers + quick presets (1Y, 5Y, 10Y, All)
- **4 display modes** — Raw value, value change, percentage, cumulative percentage change
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
| Data Sources | FRED API, DBnomics API |

---

## Project Structure

```
economix/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── fred/route.ts         # FRED API proxy
│   │   │   └── dbnomics/route.ts     # DBnomics API proxy
│   │   ├── layout.tsx                # Root layout (theme)
│   │   ├── page.tsx                  # Entry point → Dashboard
│   │   └── globals.css               # Tailwind + shadcn tokens
│   ├── components/
│   │   ├── Dashboard.tsx             # Main orchestrator (SWR, URL state, Promise.allSettled)
│   │   ├── IndicatorSelector.tsx     # Searchable multi-select with loading/error UI
│   │   ├── DatePickerRange.tsx       # Date range + quick presets
│   │   ├── ValueModeSelector.tsx     # Value/Change/%/% Change toggle
│   │   ├── DataChart.tsx             # Recharts LineChart (responsive height)
│   │   ├── StatsCards.tsx            # Stats display cards
│   │   ├── LanguageSwitcher.tsx      # 繁中/EN toggle
│   │   ├── ThemeToggle.tsx           # Dark/light theme toggle
│   │   ├── ExportButton.tsx          # CSV export
│   │   ├── Providers.tsx             # Client-side context providers
│   │   └── ui/                       # shadcn/ui primitives
│   ├── lib/
│   │   ├── indicators.ts             # Indicator definitions (52 indicators)
│   │   ├── i18n.ts                   # Translation dictionaries (en/zh-TW)
│   │   ├── LocaleContext.tsx          # React Context for locale state
│   │   ├── ThemeContext.tsx           # React Context for theme state
│   │   ├── constants.ts              # Shared constants (CHART_COLORS)
│   │   └── utils.ts                  # cn() helper
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   └── __tests__/
│       ├── i18n.test.ts              # Translation key parity tests
│       ├── indicators.test.ts        # Indicator structure validation
│       ├── chart-data.test.ts        # processDataForChart unit tests
│       └── stats.test.ts             # calculateStats unit tests
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

---

## Environment Variables

Create `.env.local` in the project root:

```env
# FRED API Key (required for FRED indicators)
FRED_API_KEY=your_api_key_here

# DBnomics does not require an API key
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
│  ┌─────────────────┐       ┌─────────────────┐           │
│  │  /api/fred      │       │  /api/dbnomics  │           │
│  │  (proxy)        │       │  (proxy)        │           │
│  └────────┬────────┘       └────────┬────────┘           │
│           │                         │                     │
└───────────┼─────────────────────────┼─────────────────────┘
            │                         │
            ▼                         ▼
    ┌───────────────┐       ┌───────────────┐
    │  FRED API     │       │  DBnomics API │
    │  (external)   │       │  (external)   │
    └───────────────┘       └───────────────┘
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

---

## Components

### `Dashboard.tsx`

The main orchestrator. Manages state via SWR and URL persistence:
- `selectedIds: string[]` — Which indicators are selected (synced to URL)
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
- Search by name, category, or description
- Per-indicator loading spinner and error badge
- Grouped layout: Country-specific → country → indicators, Global → category → indicators

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

A button that exports the current chart data to CSV format. Downloads as `economix-YYYY-MM-DD.csv`.

---

## Internationalization

The app supports two locales:
- **English** (`en`) — default
- **繁體中文** (`zh-TW`)

### How it works

- `src/lib/i18n.ts` — Translation dictionary with 50 keys
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
