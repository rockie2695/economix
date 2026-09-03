export type Locale = "en" | "zh-TW";

export type TranslationKey =
  // App chrome
  | "appTitle"
  | "appSubtitle"
  | "dataSource"
  // Indicator selector
  | "selectIndicators"
  | "searchIndicators"
  | "noIndicatorsFound"
  // Chart
  | "selectToDisplay"
  | "timeSeriesData"
  // Stats
  | "fromPrevious"
  // Value modes
  | "value"
  | "change"
  | "percent"
  | "percentChange"
  // Value mode descriptions (tooltips)
  | "valueDescription"
  | "changeDescription"
  | "percentDescription"
  | "percentChangeDescription"
  // Date picker
  | "to"
  | "all"
  // Section headers
  | "countrySpecific"
  | "global"
  // Countries
  | "country_US"
  | "country_EuroArea"
  | "country_Japan"
  | "country_China"
  | "country_UK"
  | "country_India"
  | "country_Brazil"
  | "country_SouthKorea"
  | "country_Canada"
  | "country_Australia"
  // Categories
  | "nationalAccounts"
  | "labor"
  | "prices"
  | "interestRates"
  | "stockMarket"
  | "production"
  | "housing"
  | "sentiment"
  | "trade"
  | "consumption"
  | "commodities"
  | "recessionRisk";

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    appTitle: "Economix",
    appSubtitle: "Economic Data Dashboard",
    dataSource: "Data from FRED & DBnomics",
    selectIndicators: "Select indicators...",
    searchIndicators: "Search indicators...",
    noIndicatorsFound: "No indicators found.",
    selectToDisplay: "Select indicators to display data",
    timeSeriesData: "Time Series Data",
    fromPrevious: "from previous",
    value: "Value",
    change: "Change",
    percent: "%",
    percentChange: "% Change",
    to: "to",
    all: "All",
    countrySpecific: "Country-specific",
    global: "Global",
    country_US: "United States",
    country_EuroArea: "Euro Area",
    country_Japan: "Japan",
    country_China: "China",
    country_UK: "United Kingdom",
    country_India: "India",
    country_Brazil: "Brazil",
    country_SouthKorea: "South Korea",
    country_Canada: "Canada",
    country_Australia: "Australia",
    nationalAccounts: "National Accounts",
    labor: "Labor",
    prices: "Prices",
    interestRates: "Interest Rates",
    stockMarket: "Stock Market",
    production: "Production",
    housing: "Housing",
    sentiment: "Sentiment",
    trade: "Trade",
    consumption: "Consumption",
    commodities: "Commodities",
    recessionRisk: "Recession Risk",
    valueDescription: "Raw numerical value",
    changeDescription: "Change from previous data point",
    percentDescription: "Percentage change from previous data point",
    percentChangeDescription: "Cumulative net change from start of period",
  },
  "zh-TW": {
    appTitle: "經濟指標",
    appSubtitle: "總體經濟數據儀表板",
    dataSource: "資料來源：FRED 與 DBnomics",
    selectIndicators: "選擇指標...",
    searchIndicators: "搜尋指標...",
    noIndicatorsFound: "找不到指標。",
    selectToDisplay: "選擇指標以顯示資料",
    timeSeriesData: "時間序列資料",
    fromPrevious: "较前期",
    value: "數值",
    change: "變動",
    percent: "%",
    percentChange: "% 變動",
    to: "至",
    all: "全部",
    countrySpecific: "各國數據",
    global: "全球數據",
    country_US: "美國",
    country_EuroArea: "歐元區",
    country_Japan: "日本",
    country_China: "中國",
    country_UK: "英國",
    country_India: "印度",
    country_Brazil: "巴西",
    country_SouthKorea: "南韓",
    country_Canada: "加拿大",
    country_Australia: "澳洲",
    nationalAccounts: "國民帳戶",
    labor: "勞動",
    prices: "物價",
    interestRates: "利率",
    stockMarket: "股票市場",
    production: "工業生產",
    housing: "房屋",
    sentiment: "景氣指標",
    trade: "國際貿易",
    consumption: "消費",
    commodities: "大宗商品",
    recessionRisk: "衰退風險",
    valueDescription: "原始數值",
    changeDescription: "較前一筆資料的變動",
    percentDescription: "較前一筆資料的百分比變動",
    percentChangeDescription: "自期間起始以來的累計淨變動",
  },
};

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? key;
}
