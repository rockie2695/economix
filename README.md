# Economix — Economic Data Dashboard / 經濟資料儀表板

A modern dashboard for visualizing macroeconomic data from **FRED**, **DBnomics**, and **World Bank** APIs.
現代化總體經濟資料視覺化儀表板，資料來自 **FRED**、**DBnomics** 與 **World Bank** API。

Built with Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn/ui, Recharts 3, and React Compiler.
使用 Next.js 16 App Router、TypeScript、Tailwind CSS 4、shadcn/ui、Recharts 3 及 React Compiler 建構。

Supports **繁中/English** language switching and dark/light themes. 支援**繁體中文/英文**切換及深色/淺色主題。

---

## Table of Contents / 目錄

- [Quick Start / 快速開始](#quick-start--快速開始)
- [Features / 功能特色](#features--功能特色)
- [Tech Stack / 技術架構](#tech-stack--技術架構)
- [Project Structure / 專案結構](#project-structure--專案結構)
- [Getting an API Key / 取得 API 金鑰](#getting-an-api-key--取得-api-金鑰)
- [Environment Variables / 環境變數](#environment-variables--環境變數)
- [Architecture / 系統架構](#architecture--系統架構)
- [API Routes / API 路由](#api-routes--api-路由)
- [Components / 元件](#components--元件)
- [Value Modes / 數值模式](#value-modes--數值模式)
- [Chart Enhancements / 圖表增強](#chart-enhancements--圖表增強)
- [Adding New Indicators / 新增指標](#adding-new-indicators--新增指標)
- [Testing / 測試](#testing--測試)
- [Deployment / 部署](#deployment--部署)

---

## Quick Start / 快速開始

```bash
# 1. Install dependencies / 安裝依賴
npm install

# 2. Set up environment variables / 設定環境變數
cp .env.example .env.local
# Edit .env.local and add your FRED API key / 編輯 .env.local 加入你的 FRED API 金鑰

# 3. Run the dev server / 啟動開發伺服器
npm run dev

# 4. Open in browser / 開啟瀏覽器
open http://localhost:3000
```

### Docker

```bash
# Build and run with Docker Compose / 使用 Docker Compose 建構並運行
docker compose up --build

# Or build manually / 或手動建構
docker build -t economix .
docker run -p 3000:3000 --env-file .env.local economix
```

---

## Features / 功能特色

- **Multi-indicator comparison / 多指標比較** — Select one or more indicators to overlay on the same chart / 選擇一個或多個指標疊加顯示在同一張圖表上
- **Dual Y-axis / 雙 Y 軸** — Compare indicators with different scales using left and right Y-axes / 使用左右 Y 軸比較不同量級的指標
- **10 countries + global / 10 個國家 + 全球** — US, Euro Area, Japan, China, UK, India, Brazil, South Korea, Canada, Australia + global commodities & recession risk / 美國、歐元區、日本、中國、英國、印度、巴西、南韓、加拿大、澳洲 + 全球大宗商品與衰退風險
- **Correlation analysis / 相關性分析** — Pearson correlation matrix showing relationships between selected indicators / 皮爾森相關係數矩陣，顯示所選指標之間的關係
- **Scatter plot / 散佈圖** — Visualize correlation between two indicators as a scatter plot with r-value / 以散佈圖視覺化兩個指標之間的相關性，顯示 r 值
- **Historical events overlay / 歷史事件標記** — Mark recessions, crises, and major events on the chart timeline / 在圖表時間軸上標記衰退、危機與重大事件
- **Moving average trend line / 移動平均趨勢線** — Optional 3-period moving average overlay to smooth noisy data / 可選的 3 期移動平均疊加，平滑波動數據
- **Forecast / 預測** — Linear regression extrapolation 8 periods into the future (dashed line) / 線性回歸外推未來 8 期（虛線顯示）
- **Data table / 資料表格** — Tabular view of raw chart data with pagination / 圖表原始資料的分頁表格檢視
- **5 display modes / 5 種顯示模式** — Raw value, value change, %, cumulative % change, YoY growth / 原始值、變動值、百分比、累計百分比變動、年增率
- **Searchable indicator picker / 可搜尋指標選擇器** — Filter by name, category, or description / 依名稱、類別或描述篩選
- **Date range control / 日期範圍控制** — Custom date pickers + quick presets (1Y, 5Y, 10Y, All) / 自訂日期選擇器 + 快速預設（1年、5年、10年、全部）
- **Stats cards / 統計卡片** — Current value, change %, and trend arrows at a glance / 當前值、變動百分比與趨勢箭頭一目了然
- **i18n support / 國際化** — Switch between 繁中 and English with one click / 一鍵切換繁體中文與英文
- **Dark/light theme / 深色/淺色主題** — Toggle between themes, persisted to localStorage / 切換主題，持久化至 localStorage
- **Export to CSV / 匯出 CSV** — One-click download of chart data / 一鍵下載圖表資料
- **URL state persistence / URL 狀態持久化** — Shareable links with selected indicators, dates, and display mode / 可分享連結包含所選指標、日期與顯示模式
- **Resilient fetching / 穩健抓取** — Promise.allSettled with per-indicator error handling / 使用 Promise.allSettled 搭配逐指標錯誤處理
- **React Compiler / React 編譯器** — Automatic memoization / 自動記憶化
- **Responsive / 響應式** — Works on desktop, tablet, and mobile / 支援桌面、平板與手機

---

## Tech Stack / 技術架構

| Layer / 層級 | Technology / 技術 |
|-------|-----------|
| Framework / 框架 | Next.js 16 (App Router) |
| Language / 語言 | TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui (Base UI) |
| Charts / 圖表 | Recharts 3 |
| Icons / 圖示 | Lucide React |
| State / 狀態 | SWR + React hooks |
| i18n / 國際化 | React Context + localStorage |
| Theme / 主題 | React Context + localStorage |
| Testing / 測試 | Vitest |
| Compiler / 編譯器 | React Compiler |
| Data Sources / 資料來源 | FRED API, DBnomics API, World Bank API |
| Container / 容器 | Docker + Docker Compose |

---

## Project Structure / 專案結構

```
src/
├── app/
│   ├── api/
│   │   ├── fred/route.ts         # FRED API proxy
│   │   ├── dbnomics/route.ts     # DBnomics API proxy
│   │   ├── worldbank/route.ts    # World Bank API proxy
│   │   └── exchange-rate/route.ts # Exchange rate API
│   ├── layout.tsx                # Root layout (theme, font)
│   ├── page.tsx                  # Entry point → Dashboard
│   └── globals.css               # Tailwind + shadcn tokens
├── components/
│   ├── Dashboard.tsx             # Main orchestrator (SWR, URL state)
│   ├── IndicatorSelector.tsx     # Searchable multi-select with i18n names
│   ├── DatePickerRange.tsx       # Date range + quick presets
│   ├── ValueModeSelector.tsx     # 5-mode segmented control with tooltips
│   ├── DataChart.tsx             # Recharts LineChart (dual Y-axis, events, MA, forecast)
│   ├── StatsCards.tsx            # Stats display cards
│   ├── CorrelationMatrix.tsx     # Pearson correlation matrix
│   ├── ScatterPlot.tsx           # X-Y scatter plot with r-value
│   ├── DataTable.tsx             # Paginated data table
│   ├── LanguageSwitcher.tsx      # 繁中/EN toggle
│   ├── ThemeToggle.tsx           # Dark/light theme toggle
│   ├── ExportButton.tsx          # CSV export
│   └── Providers.tsx             # Client-side context providers
├── lib/
│   ├── indicators.ts             # Indicator definitions (100+ indicators)
│   ├── i18n.ts                   # Translation dictionaries (en/zh-TW, 120+ keys)
│   ├── correlation.ts            # Pearson correlation computation
│   ├── forecast.ts               # Linear regression, moving average, forecast
│   ├── historical-events.ts      # Historical economic events data
│   ├── LocaleContext.tsx          # React Context for locale state
│   ├── ThemeContext.tsx           # React Context for theme state
│   └── constants.ts              # Shared constants (CHART_COLORS)
├── types/
│   └── index.ts                  # TypeScript interfaces
└── __tests__/                    # Vitest test suite (68 tests)
```

---

## Getting an API Key / 取得 API 金鑰

### FRED (Federal Reserve Economic Data / 聯準會經濟資料)

1. Go to https://fred.stlouisfed.org/docs/api/api_key.html / 前往官方網站
2. Click "Request API Key" / 點擊「Request API Key」
3. Fill out the form (free, instant approval) / 填寫表單（免費，即時核准）
4. Copy your API key into `.env.local` / 複製 API 金鑰至 `.env.local`

### DBnomics / World Bank

No API key required — the API is free and open. / 無需 API 金鑰，API 免費且開放。

---

## Environment Variables / 環境變數

Create `.env.local` in the project root: / 在專案根目錄建立 `.env.local`：

```env
# FRED API Key (required for FRED indicators) / FRED API 金鑰（FRED 指標必要）
FRED_API_KEY=your_api_key_here

# DBnomics does not require an API key / DBnomics 無需 API 金鑰
# World Bank does not require an API key / World Bank 無需 API 金鑰
```

---

## Architecture / 系統架構

```
┌─────────────────────────────────────────────────────────┐
│                  Browser (Client) / 瀏覽器               │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Indicator│ │ Date     │ │ Value    │ │ Chart    │  │
│  │ Selector │ │ Range    │ │ Mode     │ │ Toggles  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       └────────────┼────────────┼────────────┘         │
│                    ▼                                   │
│            ┌──────────────┐                            │
│            │  Dashboard   │ (SWR, URL state)           │
│            └──────┬───────┘                            │
│       ┌───────────┼───────────┬───────────┐            │
│       ▼           ▼           ▼           ▼            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │  Stats  │ │  Data   │ │Correlat.│ │ Scatter │     │
│  │  Cards  │ │  Chart  │ │ Matrix  │ │  Plot   │     │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │
│       │           │                                    │
│       └───────────┼────────────────────────────────┐   │
│                   ▼                                ▼   │
│  ┌─────────────────────┐  ┌─────────────────────────┐ │
│  │ Historical Events   │  │ Forecast (8 periods)    │ │
│  │ Moving Average      │  │ Linear Regression       │ │
│  └─────────────────────┘  └─────────────────────────┘ │
└───────────────────────────┬────────────────────────────┘
                            │ fetch()
                            ▼
┌──────────────────────────────────────────────────────────┐
│                Next.js API Routes / API 路由              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ /api/fred│ │/api/dbnom│ │/api/world│ │/api/exch │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
└───────┼────────────┼────────────┼────────────┼───────────┘
        ▼            ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ FRED API │ │ DBnomics │ │World Bank│ │ Exchange │
  │ (external│ │ (external│ │(external)│ │  Rate    │
  └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## API Routes / API 路由

### `GET /api/fred`

**Query Parameters / 查詢參數:**

| Param | Type | Required | Description / 說明 |
|-------|------|----------|-------------|
| `series_id` | string | Yes | FRED series ID (e.g., "GDP") / FRED 系列 ID |
| `start_date` | string | No | ISO date (default: 2000-01-01) / ISO 日期 |
| `end_date` | string | No | ISO date (default: today) / ISO 日期 |
| `locale` | string | No | `"en"` or `"zh-TW"` / 語言設定 |

### `GET /api/dbnomics`

| Param | Type | Required | Description / 說明 |
|-------|------|----------|-------------|
| `dataset_code` | string | Yes | DBnomics dataset code / DBnomics 資料集代碼 |
| `provider_code` | string | Yes | Provider code (e.g., "FRED", "IMF") / 資料提供者代碼 |
| `start_date` | string | No | ISO date / ISO 日期 |
| `end_date` | string | No | ISO date / ISO 日期 |

### `GET /api/worldbank`

| Param | Type | Required | Description / 說明 |
|-------|------|----------|-------------|
| `indicator` | string | Yes | World Bank indicator code (e.g., "NY.GDP.MKTP.CD") / World Bank 指標代碼 |
| `country` | string | No | ISO2 country code (default: "US") / ISO2 國家代碼 |
| `date` | string | No | Date range (e.g., "2020:2024") / 日期範圍 |

---

## Components / 元件

### `Dashboard.tsx` — Main Orchestrator / 主控制器

Manages state via SWR and URL persistence: / 透過 SWR 管理狀態並同步至 URL：

- `selectedIds: string[]` — Left Y-axis indicators / 左側 Y 軸指標
- `selectedIds2: string[]` — Right Y-axis indicators / 右側 Y 軸指標
- `valueMode: ValueMode` — Display mode (synced to URL) / 顯示模式
- `dateRange: DateRange` — Start and end dates / 起訖日期
- `showEvents` — Historical events toggle / 歷史事件開關
- `showMovingAverage` — Moving average toggle / 移動平均開關
- `showForecast` — Forecast toggle / 預測開關

### `DataChart.tsx` — Time Series Chart / 時間序列圖表

Recharts LineChart with: / 使用 Recharts LineChart，支援：

- Dual Y-axis (left = solid, right = dashed) / 雙 Y 軸（左=實線，右=虛線）
- Historical event reference lines / 歷史事件參考線
- Moving average overlay / 移動平均疊加
- Forecast extrapolation / 預測外推

### `CorrelationMatrix.tsx` — Correlation Analysis / 相關性分析

Displays pairwise Pearson correlation coefficients between indicators. / 顯示指標間的皮爾森相關係數配對。

### `ScatterPlot.tsx` — Scatter Plot / 散佈圖

Plots two indicators against each other on X-Y axes. / 在 X-Y 軸上繪製兩個指標的散佈圖。

### `DataTable.tsx` — Data Table / 資料表格

Paginated tabular view (20 rows/page) with color-coded columns. / 分頁表格檢視（每頁 20 列），欄位顏色標示。

---

## Value Modes / 數值模式

| Mode / 模式 | Formula / 公式 | Description / 說明 |
|------|---------|-------------|
| **Value / 數值** | `point.value` | Raw value / 原始值 |
| **Change / 變動** | `value[i] - value[i-1]` | Absolute change / 絕對變動 |
| **%** | `((v[i] - v[i-1]) / v[i-1]) * 100` | Period-over-period % / 期間百分比變動 |
| **% Change / 累計%** | `((v[i] - v[0]) / v[0]) * 100` | Cumulative from start / 自起始累計百分比 |
| **YoY / 年增率** | `((v[i] - v[1yr]) / v[1yr]) * 100` | Year-over-year / 年增率 |

---

## Chart Enhancements / 圖表增強

| Toggle / 開關 | Effect / 效果 |
|--------|--------|
| **Events / 事件** | Vertical dashed lines for historical events (recessions, crises, policy changes) / 歷史事件垂直虛線（衰退、危機、政策變動） |
| **Trend / 趨勢** | 3-period moving average line per indicator (dashed, semi-transparent) / 每個指標的 3 期移動平均線（虛線，半透明） |
| **Forecast / 預測** | Linear regression extrapolation 8 periods ahead (dashed line) / 線性回歸外推未來 8 期（虛線） |

---

## Adding New Indicators / 新增指標

### FRED Indicator / FRED 指標

Edit `src/lib/indicators.ts`:

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
  country: "US",
}
```

### DBnomics Indicator / DBnomics 指標

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

### World Bank Indicator / World Bank 指標

```typescript
{
  id: "wb_indicator",
  name: "World Bank Indicator",
  source: "worldbank",
  seriesId: "INDICATOR_CODE",
  countryCode: "US",
  unit: "Units",
  category: "nationalAccounts",
  description: "Description text",
  categoryType: "country",
  country: "US",
}
```

---

## Testing / 測試

```bash
npm test           # Run all tests / 執行所有測試
npx vitest         # Watch mode / 監聽模式
```

### Test Files / 測試檔案

| File / 檔案 | Coverage / 覆蓋範圍 |
|------|----------|
| `chart-data.test.ts` | `processDataForChart()` — all 5 value modes / 全部 5 種數值模式 |
| `correlation.test.ts` | `pearsonCorrelation()`, `interpretCorrelation()`, `computeCorrelationMatrix()` |
| `forecast.test.ts` | `linearRegression()`, `movingAverage()`, `forecast()` |
| `i18n.test.ts` | Translation key parity / 翻譯鍵一致性 |
| `indicators.test.ts` | Indicator structure / 指標結構 |
| `stats.test.ts` | `calculateStats()` |
| `api-errors.test.ts` | API error messages / API 錯誤訊息 |
| `url-state.test.ts` | URL state parsing / URL 狀態解析 |

---

## Deployment / 部署

### Vercel (Recommended / 推薦)

```bash
npm i -g vercel
vercel
vercel env add FRED_API_KEY
```

### Docker

```bash
docker compose up --build
```

Uses multi-stage build with `output: "standalone"` for minimal image size.
使用多階段建構搭配 `output: "standalone"` 以最小化映像檔大小。

### Self-Hosted / 自架

```bash
npm run build
npm run start
```

---

## License / 授權條款

MIT
