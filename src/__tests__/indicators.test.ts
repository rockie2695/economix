import { describe, it, expect } from "vitest";
import { indicators } from "@/lib/indicators";

describe("indicators", () => {
  it("should have unique IDs for all indicators", () => {
    const ids = indicators.map((i) => i.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have categoryType on every indicator", () => {
    for (const indicator of indicators) {
      expect(["country", "global"]).toContain(indicator.categoryType);
    }
  });

  it("should have country field on country-specific indicators", () => {
    const countryIndicators = indicators.filter(
      (i) => i.categoryType === "country"
    );
    expect(countryIndicators.length).toBeGreaterThan(0);

    for (const indicator of countryIndicators) {
      expect(indicator.country).toBeDefined();
      expect(typeof indicator.country).toBe("string");
    }
  });

  it("should not have country field on global indicators", () => {
    const globalIndicators = indicators.filter(
      (i) => i.categoryType === "global"
    );
    expect(globalIndicators.length).toBeGreaterThan(0);

    for (const indicator of globalIndicators) {
      expect(indicator.country).toBeUndefined();
    }
  });

  it("should have seriesId on all FRED indicators", () => {
    const fredIndicators = indicators.filter((i) => i.source === "fred");
    expect(fredIndicators.length).toBeGreaterThan(0);

    for (const indicator of fredIndicators) {
      expect(indicator.seriesId).toBeDefined();
      expect(typeof indicator.seriesId).toBe("string");
      expect(indicator.seriesId!.length).toBeGreaterThan(0);
    }
  });

  it("should have datasetCode and providerCode on all DBnomics indicators", () => {
    const dbnomicsIndicators = indicators.filter(
      (i) => i.source === "dbnomics"
    );
    expect(dbnomicsIndicators.length).toBeGreaterThan(0);

    for (const indicator of dbnomicsIndicators) {
      expect(indicator.datasetCode).toBeDefined();
      expect(typeof indicator.datasetCode).toBe("string");
      expect(indicator.providerCode).toBeDefined();
      expect(typeof indicator.providerCode).toBe("string");
    }
  });

  it("should have required fields on every indicator", () => {
    for (const indicator of indicators) {
      expect(indicator.id).toBeDefined();
      expect(indicator.id.length).toBeGreaterThan(0);
      expect(indicator.name).toBeDefined();
      expect(indicator.name.length).toBeGreaterThan(0);
      expect(indicator.source).toBeDefined();
      expect(["fred", "dbnomics"]).toContain(indicator.source);
      expect(indicator.category).toBeDefined();
      expect(indicator.category.length).toBeGreaterThan(0);
    }
  });

  it("should contain indicators from all 10 countries", () => {
    const countryIndicators = indicators.filter(
      (i) => i.categoryType === "country"
    );
    const countries = new Set(countryIndicators.map((i) => i.country));

    expect(countries.has("US")).toBe(true);
    expect(countries.has("EuroArea")).toBe(true);
    expect(countries.has("Japan")).toBe(true);
    expect(countries.has("China")).toBe(true);
    expect(countries.has("UK")).toBe(true);
    expect(countries.has("India")).toBe(true);
    expect(countries.has("Brazil")).toBe(true);
    expect(countries.has("SouthKorea")).toBe(true);
    expect(countries.has("Canada")).toBe(true);
    expect(countries.has("Australia")).toBe(true);
  });

  it("should have recession risk indicators", () => {
    const recessionIndicators = indicators.filter(
      (i) => i.category === "recessionRisk"
    );
    expect(recessionIndicators.length).toBeGreaterThanOrEqual(3);

    const ids = recessionIndicators.map((i) => i.id);
    expect(ids).toContain("yield_curve_10y2y");
    expect(ids).toContain("yield_curve_10y3m");
    expect(ids).toContain("leading_index");
  });

  it("should have at least 40 total indicators", () => {
    expect(indicators.length).toBeGreaterThanOrEqual(40);
  });
});
