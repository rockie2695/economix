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
  | "reset"
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
  | "recessionRisk"
  // USD conversion
  | "convertToUSD"
  | "convertToUSDDescription"
  // Right axis
  | "selectRightAxisIndicators"
  | "leftAxis"
  | "rightAxis"
  // Dual Y-axis
  | "dualYAxis"
  | "dualYAxisDescription"
  // Correlation analysis
  | "correlationAnalysis"
  | "strongPositive"
  | "moderatePositive"
  | "moderateNegative"
  | "strongNegative"
  | "strong_positive"
  | "moderate_positive"
  | "weak_positive"
  | "none"
  | "weak_negative"
  | "moderate_negative"
  | "strong_negative";

export const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    appTitle: "Economix",
    appSubtitle: "Economic Data Dashboard",
    dataSource: "Data from FRED, DBnomics & World Bank",
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
    reset: "Reset",
    changeDescription: "Change from previous data point",
    percentDescription: "Percentage change from previous data point",
    percentChangeDescription: "Cumulative net change from start of period",
    convertToUSD: "Convert to USD",
    convertToUSDDescription:
      "Convert non-USD values to US Dollars using exchange rates",
    selectRightAxisIndicators: "Select right Y-axis indicators...",
    leftAxis: "Left Axis",
    rightAxis: "Right Axis",
    dualYAxis: "Dual Y-Axis",
    dualYAxisDescription: "Compare indicators with different scales using two Y-axes",
    correlationAnalysis: "Correlation Analysis",
    strongPositive: "Strong Positive",
    moderatePositive: "Moderate Positive",
    moderateNegative: "Moderate Negative",
    strongNegative: "Strong Negative",
    strong_positive: "Strong Positive",
    moderate_positive: "Moderate Positive",
    weak_positive: "Weak Positive",
    none: "No Correlation",
    weak_negative: "Weak Negative",
    moderate_negative: "Moderate Negative",
    strong_negative: "Strong Negative",
  },
  "zh-TW": {
    appTitle: "經濟指標",
    appSubtitle: "總體經濟數據儀表板",
    dataSource: "資料來源：FRED、DBnomics 與 World Bank",
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
    reset: "重置",
    changeDescription: "較前一筆資料的變動",
    percentDescription: "較前一筆資料的百分比變動",
    percentChangeDescription: "自期間起始以來的累計淨變動",
    convertToUSD: "轉換為美元",
    convertToUSDDescription: "使用匯率將非美元數值轉換為美元",
    selectRightAxisIndicators: "選擇右側 Y 軸指標...",
    leftAxis: "左軸",
    rightAxis: "右軸",
    dualYAxis: "雙 Y 軸",
    dualYAxisDescription: "使用兩個 Y 軸比較不同量級的指標",
    correlationAnalysis: "相關性分析",
    strongPositive: "強正相關",
    moderatePositive: "中度正相關",
    moderateNegative: "中度負相關",
    strongNegative: "強負相關",
    strong_positive: "強正相關",
    moderate_positive: "中度正相關",
    weak_positive: "弱正相關",
    none: "無相關",
    weak_negative: "弱負相關",
    moderate_negative: "中度負相關",
    strong_negative: "強負相關",
  },
};

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] ?? key;
}
