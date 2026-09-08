import { describe, it, expect } from "vitest";
import { getErrorMessage, type Locale } from "@/lib/api-errors";

describe("api-errors", () => {
  it("should return English error messages by default", () => {
    expect(getErrorMessage("series_id is required")).toBe("series_id is required");
    expect(getErrorMessage("FRED API key not configured")).toContain("FRED API key");
    expect(getErrorMessage("Failed to fetch data from FRED")).toBe("Failed to fetch data from FRED");
    expect(getErrorMessage("dataset_code and provider_code are required")).toContain("dataset_code");
    expect(getErrorMessage("Failed to fetch data from DBnomics")).toBe("Failed to fetch data from DBnomics");
    expect(getErrorMessage("indicator parameter is required")).toContain("indicator");
    expect(getErrorMessage("Failed to fetch data from World Bank")).toBe("Failed to fetch data from World Bank");
  });

  it("should return Chinese error messages for zh-TW locale", () => {
    const zhTW: Locale = "zh-TW";
    expect(getErrorMessage("series_id is required", zhTW)).toBe("series_id 為必填欄位");
    expect(getErrorMessage("FRED API key not configured", zhTW)).toContain("FRED API 金鑰");
    expect(getErrorMessage("Failed to fetch data from FRED", zhTW)).toBe("無法從 FRED 取得資料");
    expect(getErrorMessage("dataset_code and provider_code are required", zhTW)).toContain("必填欄位");
    expect(getErrorMessage("Failed to fetch data from DBnomics", zhTW)).toBe("無法從 DBnomics 取得資料");
    expect(getErrorMessage("indicator parameter is required", zhTW)).toContain("必填");
    expect(getErrorMessage("Failed to fetch data from World Bank", zhTW)).toBe("無法從 World Bank 取得資料");
  });

  it("should return the key itself for unknown error keys", () => {
    expect(getErrorMessage("unknown_error")).toBe("unknown_error");
    expect(getErrorMessage("unknown_error", "zh-TW")).toBe("unknown_error");
  });
});
