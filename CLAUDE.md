# CLAUDE.md — Economix Project Context

## What is this?

Economix is a Next.js dashboard that fetches and visualizes macroeconomic data from FRED and DBnomics APIs.

## Quick Reference

- **Stack**: Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), Recharts 3
- **Theme**: Dark mode by default
- **APIs**: FRED (requires key), DBnomics (free)
- **Key file**: `src/components/Dashboard.tsx` — main orchestrator

## Running

```bash
npm install
npm run dev        # http://localhost:3000
```

## Environment

`.env.local`:
```
FRED_API_KEY=your_key_here
```

## Adding an Indicator

Edit `src/lib/indicators.ts`, add entry:

```typescript
{
  id: "unique_id",
  name: "Display Name",
  source: "fred",  // or "dbnomics"
  seriesId: "SERIES_ID",  // for FRED
  // datasetCode: "CODE", providerCode: "PROVIDER",  // for DBnomics
  unit: "Units",
  category: "Category",
  description: "Description",
}
```

No other code changes needed.

## Key Files

| File | Purpose |
|------|---------|
| `src/components/Dashboard.tsx` | Main state, data fetching, layout |
| `src/components/IndicatorSelector.tsx` | Multi-select popover |
| `src/components/DataChart.tsx` | Recharts wrapper |
| `src/components/StatsCards.tsx` | Stats display |
| `src/lib/indicators.ts` | Indicator definitions |
| `src/types/index.ts` | TypeScript interfaces |
| `src/app/api/fred/route.ts` | FRED API proxy |
| `src/app/api/dbnomics/route.ts` | DBnomics API proxy |

## Architecture Notes

- API routes hide external API keys from the client
- Data is fetched in parallel for multiple indicators
- Chart colors are assigned by selection order
- Stats compute change from previous data point
- 4 display modes: raw value, change, %, % change

---

@AGENTS.md
