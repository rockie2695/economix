export type Locale = "en" | "zh-TW";

const errorMessages: Record<Locale, Record<string, string>> = {
  en: {
    "series_id is required": "series_id is required",
    "FRED API key not configured": "FRED API key not configured. Set FRED_API_KEY in .env.local",
    "Failed to fetch data from FRED": "Failed to fetch data from FRED",
    "dataset_code and provider_code are required": "dataset_code and provider_code are required",
    "Failed to fetch data from DBnomics": "Failed to fetch data from DBnomics",
    "indicator parameter is required": "indicator parameter is required",
    "Failed to fetch data from World Bank": "Failed to fetch data from World Bank",
  },
  "zh-TW": {
    "series_id is required": "series_id 為必填欄位",
    "FRED API key not configured": "FRED API 金鑰未設定。請在 .env.local 中設定 FRED_API_KEY",
    "Failed to fetch data from FRED": "無法從 FRED 取得資料",
    "dataset_code and provider_code are required": "dataset_code 和 provider_code 為必填欄位",
    "Failed to fetch data from DBnomics": "無法從 DBnomics 取得資料",
    "indicator parameter is required": "indicator 參數為必填欄位",
    "Failed to fetch data from World Bank": "無法從 World Bank 取得資料",
  },
};

export function getErrorMessage(key: string, locale: Locale = "en"): string {
  return errorMessages[locale]?.[key] ?? errorMessages.en[key] ?? key;
}
