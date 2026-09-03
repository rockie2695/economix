# CLAUDE.md — Economix Project Context

## What is this?

Economix is a Next.js dashboard that fetches and visualizes macroeconomic data from FRED and DBnomics APIs. Supports 繁中/English language switching.

## Quick Reference

- **Stack**: Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), Recharts 3
- **Theme**: Dark mode by default
- **i18n**: React Context (en/zh-TW), `useLocale()` hook, localStorage persistence
- **Testing**: Vitest (`npm test`)
- **APIs**: FRED (requires key), DBnomics (free)
- **Key file**: `src/components/Dashboard.tsx` — main orchestrator

## Running

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Run tests
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
  category: "nationalAccounts",  // category key from i18n
  description: "Description",
  categoryType: "country",  // or "global"
  country: "US",  // "US", "EuroArea", "Japan", "China", "UK" — omit for global
}
```

No other code changes needed.

## Key Files

| File | Purpose |
|------|---------|
| `src/components/Dashboard.tsx` | Main state, data fetching, layout. Exports `processDataForChart()` and `calculateStats()` |
| `src/components/IndicatorSelector.tsx` | Grouped multi-select popover (by country/global) |
| `src/components/DataChart.tsx` | Recharts wrapper |
| `src/components/StatsCards.tsx` | Stats display |
| `src/components/LanguageSwitcher.tsx` | 繁中/EN toggle |
| `src/lib/indicators.ts` | Indicator definitions (29 indicators, 5 countries + global) |
| `src/lib/i18n.ts` | Translation dictionaries (en/zh-TW) |
| `src/lib/LocaleContext.tsx` | React Context: `useLocale()` → `{ locale, setLocale, t }` |
| `src/types/index.ts` | TypeScript interfaces |
| `src/app/api/fred/route.ts` | FRED API proxy |
| `src/app/api/dbnomics/route.ts` | DBnomics API proxy |

## Architecture Notes

- API routes hide external API keys from the client
- Data is fetched in parallel for multiple indicators
- Chart colors are assigned by selection order
- Stats compute change from previous data point
- 4 display modes: raw value, change, %, % change
- Indicators grouped by `categoryType` (country vs global) and `country`
- i18n keys defined in `src/lib/i18n.ts`, used via `useLocale().t("key")`
- Tests in `src/__tests__/`, run with `npm test`

---

@AGENTS.md
