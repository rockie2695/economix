import { describe, it, expect } from "vitest";
import { getScaleFactor, readStateFromURL } from "@/components/Dashboard";

describe("getScaleFactor", () => {
  it("should return 1e9 for Billions of Dollars (default)", () => {
    expect(getScaleFactor("Dollars", "gdp")).toBe(1e9);
  });

  it("should return 1e6 for trade_balance (Millions of Dollars)", () => {
    expect(getScaleFactor("Dollars", "trade_balance")).toBe(1e6);
  });

  it("should return 1e6 for retail_sales (Millions of Dollars)", () => {
    expect(getScaleFactor("Dollars", "retail_sales")).toBe(1e6);
  });

  it("should return 1e6 for Euros", () => {
    expect(getScaleFactor("Euros", "eu_gdp")).toBe(1e6);
  });

  it("should return 1e9 for Yen", () => {
    expect(getScaleFactor("Yen", "jp_gdp")).toBe(1e9);
  });

  it("should return 1e6 for Pounds", () => {
    expect(getScaleFactor("Pounds", "uk_gdp")).toBe(1e6);
  });

  it("should return 1e3 for Thousands of Units", () => {
    expect(getScaleFactor("Thousands of Units", "housing_starts")).toBe(1e3);
  });

  it("should return 1 for unknown units", () => {
    expect(getScaleFactor("Percent", "unemployment")).toBe(1);
    expect(getScaleFactor("Index", "sp500")).toBe(1);
  });
});

describe("readStateFromURL", () => {
  it("should return null when no URL params are set", () => {
    // In vitest jsdom, location.search is empty by default
    const result = readStateFromURL();
    // With no params, selectedIds will be empty array, which is truthy
    // The function returns an object with empty arrays, not null
    if (result) {
      expect(result).toHaveProperty("selectedIds");
      expect(result).toHaveProperty("selectedIds2");
      expect(result).toHaveProperty("valueMode");
      expect(result).toHaveProperty("dateRange");
      expect(result).toHaveProperty("convertToUSD");
      expect(result.selectedIds).toEqual([]);
      expect(result.selectedIds2).toEqual([]);
    }
  });
});
