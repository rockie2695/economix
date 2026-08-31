<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — AI Agent Context for Economix

## Project Overview

Economix is a macroeconomic data visualization dashboard. It fetches data from FRED and DBnomics APIs, displays time-series charts, and computes basic statistics.

**Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), Recharts 3

## File Map

```
src/
├── app/
│   ├── api/
│   │   ├── fred/route.ts         # FRED API proxy (server-side, hides API key)
│   │   └── dbnomics/route.ts     # DBnomics API proxy (server-side)
│   ├── layout.tsx                # Root layout, dark theme, Geist font
│   ├── page.tsx                  # Entry → renders <Dashboard />
│   └── globals.css               # Tailwind imports + shadcn CSS variables
├── components/
│   ├── Dashboard.tsx             # Main orchestrator (state, fetch, layout)
│   ├── IndicatorSelector.tsx     # Searchable multi-select popover
│   ├── DatePickerRange.tsx       # Date range inputs + quick presets
│   ├── ValueModeSelector.tsx     # Segmented control (4 modes)
│   ├── DataChart.tsx             # Recharts LineChart wrapper
│   ├── StatsCards.tsx            # Stats cards grid
│   └── ui/                       # shadcn/ui primitives (button, card, etc.)
├── lib/
│   ├── indicators.ts             # Indicator definitions array
│   └── utils.ts                  # cn() merge helper
└── types/
    └── index.ts                  # All TypeScript interfaces
```

## Key Data Types

```typescript
// Indicator definition — what data is available
interface Indicator {
  id: string;              // unique key, e.g. "gdp"
  name: string;            // display name, e.g. "GDP"
  source: "fred" | "dbnomics";
  seriesId?: string;       // FRED series ID
  datasetCode?: string;    // DBnomics dataset code
  providerCode?: string;   // DBnomics provider code
  unit?: string;           // display unit, e.g. "Billions of Dollars"
  category: string;        // grouping, e.g. "National Accounts"
  description?: string;    // human-readable description
}

// Raw data point from API
interface DataPoint {
  date: string;            // ISO date string "YYYY-MM-DD"
  value: number;
}

// Time series for one indicator
interface TimeSeriesData {
  indicatorId: string;
  indicatorName: string;
  unit: string;
  data: DataPoint[];
}

// How to transform values for display
type ValueMode = "value" | "valueChange" | "percentage" | "percentageChange";

// Date range for API queries
interface DateRange {
  startDate: string;       // ISO date
  endDate: string;         // ISO date
}

// Processed data point for Recharts (multiple indicators merged by date)
interface ChartDataPoint {
  date: string;
  [indicatorId: string]: string | number;
}

// Computed stats for one indicator
interface StatsData {
  indicatorId: string;
  indicatorName: string;
  currentValue: number;
  previousValue: number | null;
  change: number;          // absolute change
  changePercent: number;   // percentage change
  min: number;
  max: number;
  unit: string;
}
```

## Key Patterns

### Data Flow

```
User selects indicators
  → Dashboard.selectedIds updates
  → useEffect triggers fetchData(selectedIds)
  → Parallel fetch() to /api/fred or /api/dbnomics
  → API routes proxy to external APIs (hides keys)
  → Response stored in Dashboard.allData
  → processDataForChart() transforms by ValueMode
  → calculateStats() computes stats
  → DataChart + StatsCards render
```

### Value Mode Transformations

| Mode | Formula | Use Case |
|------|---------|----------|
| `value` | `point.value` | Default raw view |
| `valueChange` | `point.value - prev.value` | Absolute change |
| `percentage` | `((point.value - prev.value) / prev.value) * 100` | % change |
| `percentageChange` | Same as `percentage` | Alias |

### Chart Color Assignment

Colors are assigned by selection order, not indicator ID:
```typescript
const CHART_COLORS = ["#3b82f6", "#ef4444", "#10b981", ...];
// Color = CHART_COLORS[selectionIndex % CHART_COLORS.length]
```

### API Key Security

FRED API key is stored in `.env.local` (git-ignored) and accessed via `process.env.FRED_API_KEY` in server-side API routes only. Never exposed to the client bundle.

## Common Edits

### Add a new FRED indicator

Edit `src/lib/indicators.ts`, add to the `indicators` array:
```typescript
{
  id: "new_indicator",
  name: "New Indicator",
  source: "fred",
  seriesId: "FRED_SERIES_ID",
  unit: "Units",
  category: "Category",
  description: "Description",
}
```

### Add a new DBnomics indicator

Edit `src/lib/indicators.ts`:
```typescript
{
  id: "new_dataset",
  name: "New Dataset",
  source: "dbnomics",
  datasetCode: "DATASET_CODE",
  providerCode: "PROVIDER",
  unit: "Units",
  category: "Category",
  description: "Description",
}
```

### Change chart colors

Edit the `CHART_COLORS` array in `src/components/Dashboard.tsx` (line 19).

### Modify stats calculation

Edit `calculateStats()` in `src/components/Dashboard.tsx` (line 82).

### Adjust date range defaults

Edit the `dateRange` initial state in `Dashboard.tsx` (line 110).

## Tech Notes

### shadcn/ui v4 (Base UI)

This project uses shadcn/ui v4 which is built on `@base-ui/react`, NOT Radix UI. Key differences:
- `asChild` prop is NOT available on components
- Use `<PopoverTrigger>` directly (no `asChild`)
- Button is from `@base-ui/react/button`, not Radix

### Recharts

- Always wrap in `<ResponsiveContainer width="100%" height={N}>`
- Use `type="monotone"` for smooth curves
- `dot={false}` by default, `activeDot` for hover
- Custom tooltip via `content={<CustomTooltip />}` prop

### Fetch Pattern

Client components use `fetch()` to call internal API routes:
```typescript
const response = await fetch(`/api/fred?series_id=GDP&start_date=2020-01-01`);
const data = await response.json();
// data.observations = [{ date, value }, ...]
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FRED_API_KEY` | Yes | API key from https://fred.stlouisfed.org/docs/api/api_key.html |

DBnomics does not require an API key.
