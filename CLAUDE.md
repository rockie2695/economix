# CLAUDE.md — Economix Project Context

## What is this?

Economix is a Next.js dashboard that fetches and visualizes macroeconomic data from FRED, DBnomics, and World Bank APIs. Supports 繁中/English language switching and dark/light themes.

## Quick Reference

- **Stack**: Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), Recharts 3
- **Compiler**: React Compiler (babel-plugin-react-compiler) for automatic memoization
- **State**: SWR for data fetching, URL state persistence for shareable links
- **Theme**: Dark/light toggle, persisted to localStorage
- **i18n**: React Context (en/zh-TW), `useLocale()` hook, localStorage persistence
- **Testing**: Vitest (`npm test`) — 44 tests across 6 files
- **APIs**: FRED (requires key), DBnomics (free), World Bank (free)
- **Key file**: `src/components/Dashboard.tsx` — main orchestrator

## Running

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Run tests (44 tests)
npm run build      # Production build
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
  nameKey: "translationKey",  // optional: i18n key for indicator name
  source: "fred",  // or "dbnomics" or "worldbank"
  seriesId: "SERIES_ID",  // for FRED/worldbank
  // datasetCode: "CODE", providerCode: "PROVIDER",  // for DBnomics
  unit: "Units",
  category: "nationalAccounts",  // category key from i18n
  description: "Description",
  categoryType: "country",  // or "global"
  country: "US",  // "US", "EuroArea", "Japan", "China", "UK", "India", "Brazil", "SouthKorea", "Canada", "Australia" — omit for global
}
```

No other code changes needed.

## Key Files

| File | Purpose |
|------|---------|
| `src/components/Dashboard.tsx` | Main state (SWR, URL persistence, Promise.allSettled), layout. Exports `processDataForChart()`, `calculateStats()`, `getIndicatorDisplayName()` |
| `src/components/IndicatorSelector.tsx` | Grouped multi-select popover with per-indicator loading/error UI. Uses `getIndicatorName()` for translated names |
| `src/components/DataChart.tsx` | Recharts wrapper (responsive height, dual Y-axis) |
| `src/components/StatsCards.tsx` | Stats display (theme-aware colors) |
| `src/components/ValueModeSelector.tsx` | Value mode segmented control with tooltip descriptions |
| `src/components/LanguageSwitcher.tsx` | 繁中/EN toggle |
| `src/components/ThemeToggle.tsx` | Dark/light theme toggle |
| `src/components/ExportButton.tsx` | CSV export with `csvEscape()` for proper quoting |
| `src/components/Providers.tsx` | Context providers (Locale + Theme) |
| `src/components/CorrelationMatrix.tsx` | Correlation matrix with i18n'd indicator names |
| `src/lib/indicators.ts` | Indicator definitions (52 indicators, 10 countries + global + recession risk) |
| `src/lib/i18n.ts` | Translation dictionaries (en/zh-TW, 93 keys including indicator names) |
| `src/lib/api-errors.ts` | Locale-aware API error messages (EN/zh-TW) |
| `src/lib/LocaleContext.tsx` | React Context: `useLocale()` → `{ locale, setLocale, t }` |
| `src/lib/ThemeContext.tsx` | React Context: `useTheme()` → `{ theme, setTheme }` |
| `src/lib/constants.ts` | Shared constants (CHART_COLORS) |
| `src/types/index.ts` | TypeScript interfaces |
| `src/app/api/fred/route.ts` | FRED API proxy (accepts `locale` query param) |
| `src/app/api/dbnomics/route.ts` | DBnomics API proxy (accepts `locale` query param) |
| `src/app/api/worldbank/route.ts` | World Bank API proxy (accepts `locale` query param) |

## Architecture Notes

- API routes hide external API keys from the client
- API routes accept `locale` query param for localized error messages via `src/lib/api-errors.ts`
- Promise.allSettled for resilient parallel fetching — individual failures don't block others
- Per-indicator `loadingIds` and `fetchErrors` state for granular UI feedback
- `useMemo` for chartData and stats computation
- URL state persistence — selected indicators, dates, and display mode synced to URL params
- Dark/light theme via CSS class on `<html>`, persisted to localStorage
- SWR for data fetching with deduplication (dedupingInterval: 0 for fresh data)
- React Compiler for automatic memoization
- Chart colors assigned by selection order via shared CHART_COLORS
- Stats compute change from previous data point
- 4 display modes: raw value, change, % (period-over-period), % change (cumulative from start)
- Indicator names translated via `nameKey` field — `getIndicatorDisplayName()` in Dashboard, `getIndicatorName()` in IndicatorSelector
- Indicators grouped by `categoryType` (country vs global) and `country`
- i18n keys defined in `src/lib/i18n.ts`, used via `useLocale().t("key")`
- Recession risk indicators: yield curve (10Y-2Y, 10Y-3M) and Leading Economic Index
- Tests in `src/__tests__/` (6 files, 44 tests), run with `npm test`

---

@AGENTS.md
