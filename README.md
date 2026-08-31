# Economix — Economic Data Dashboard

A modern, dark-themed dashboard for visualizing macroeconomic data from **FRED** and **DBnomics** APIs. Built with Next.js App Router, TypeScript, Tailwind CSS, and Recharts.

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
- [Adding New Indicators](#adding-new-indicators)
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
- **Searchable indicator picker** — Filter by name, category, or description
- **Date range control** — Custom date pickers + quick presets (1Y, 5Y, 10Y, All)
- **4 display modes** — Raw value, value change, percentage, percentage change
- **Interactive tooltips** — Hover over chart lines to see exact values
- **Stats cards** — Current value, change %, and trend arrows at a glance
- **Dark theme** — Easy on the eyes for extended analysis sessions
- **Responsive** — Works on desktop and tablet

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui (Base UI) |
| Charts | Recharts 3 |
| Icons | Lucide React |
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
│   │   ├── layout.tsx                # Root layout (dark theme)
│   │   ├── page.tsx                  # Entry point → Dashboard
│   │   └── globals.css               # Tailwind + shadcn tokens
│   ├── components/
│   │   ├── Dashboard.tsx             # Main orchestrator (state, data fetching)
│   │   ├── IndicatorSelector.tsx     # Searchable multi-select popover
│   │   ├── DatePickerRange.tsx       # Date range + quick presets
│   │   ├── ValueModeSelector.tsx     # Value/Change/%/% Change toggle
│   │   ├── DataChart.tsx             # Recharts LineChart wrapper
│   │   ├── StatsCards.tsx            # Stats display cards
│   │   └── ui/                       # shadcn/ui primitives
│   ├── lib/
│   │   ├── indicators.ts             # Indicator definitions (16 indicators)
│   │   └── utils.ts                  # cn() helper
│   └── types/
│       └── index.ts                  # TypeScript interfaces
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

### FRED Indicators (require API key)

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

### DBnomics Indicators (free, no key)

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
│                    │   Dashboard   │  (state management) │
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

1. User selects indicators → `Dashboard` updates `selectedIds` state
2. `useEffect` triggers `fetchData(selectedIds)` when selection or date range changes
3. `fetchData` makes parallel `fetch()` calls to `/api/fred` or `/api/dbnomics`
4. API routes proxy requests to external APIs, hiding API keys from the client
5. Response data is stored in `allData` state as `TimeSeriesData[]`
6. `processDataForChart()` transforms data based on selected `ValueMode`
7. `calculateStats()` computes current values, changes, and percentages
8. `DataChart` and `StatsCards` render the processed data

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

The main orchestrator. Manages all state:
- `selectedIds: string[]` — Which indicators are selected
- `valueMode: ValueMode` — How to display values
- `dateRange: DateRange` — Start and end dates
- `allData: TimeSeriesData[]` — Fetched data from APIs
- `isLoading: boolean` — Loading state
- `error: string | null` — Error message

### `IndicatorSelector.tsx`

A popover with a searchable list of indicators. Supports:
- Multi-select with badge chips
- Click badges to remove
- Search by name, category, or description
- Shows source (FRED/DBN) and category for each indicator

### `DatePickerRange.tsx`

Date range input with quick-select buttons:
- Custom date inputs for start/end
- Preset buttons: 1Y, 5Y, 10Y, All

### `ValueModeSelector.tsx`

A segmented control with 4 display modes:

| Mode | Description |
|------|-------------|
| **Value** | Raw numerical value |
| **Change** | Absolute change from previous data point |
| **%** | Percentage change from previous data point |
| **% Change** | Same as % (alias) |

### `DataChart.tsx`

A Recharts `LineChart` wrapper with:
- Responsive container (fills parent width)
- Custom dark-themed tooltip
- Color-coded lines per indicator
- Grid lines matching the dark theme

### `StatsCards.tsx`

A grid of stat cards showing for each indicator:
- Current value with unit
- Change % from previous period
- Trend arrow (up/down/neutral)

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
  category: "Category",
  description: "Description text",
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
  category: "Category",
  description: "Description text",
}
```

No other code changes needed — the dashboard auto-discovers indicators from the array.

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
