import { describe, it, expect } from "vitest";
import { processDataForChart } from "@/components/Dashboard";
import type { TimeSeriesData } from "@/types";

const sampleData: TimeSeriesData[] = [
  {
    indicatorId: "gdp",
    indicatorName: "GDP",
    unit: "Billions of Dollars",
    data: [
      { date: "2020-01-01", value: 21000 },
      { date: "2020-04-01", value: 19000 },
      { date: "2020-07-01", value: 21500 },
    ],
  },
];

const multiIndicatorData: TimeSeriesData[] = [
  {
    indicatorId: "gdp",
    indicatorName: "GDP",
    unit: "Billions",
    data: [
      { date: "2020-01-01", value: 100 },
      { date: "2020-04-01", value: 110 },
    ],
  },
  {
    indicatorId: "unemployment",
    indicatorName: "Unemployment Rate",
    unit: "Percent",
    data: [
      { date: "2020-01-01", value: 3.5 },
      { date: "2020-04-01", value: 14.7 },
    ],
  },
];

describe("processDataForChart", () => {
  it("should pass through raw values in 'value' mode", () => {
    const result = processDataForChart(sampleData, "value");

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ date: "2020-01-01", gdp: 21000 });
    expect(result[1]).toEqual({ date: "2020-04-01", gdp: 19000 });
    expect(result[2]).toEqual({ date: "2020-07-01", gdp: 21500 });
  });

  it("should compute absolute change in 'valueChange' mode", () => {
    const result = processDataForChart(sampleData, "valueChange");

    expect(result[0].gdp).toBe(0); // first point has no previous
    expect(result[1].gdp).toBe(-2000); // 19000 - 21000
    expect(result[2].gdp).toBe(2500); // 21500 - 19000
  });

  it("should compute percentage change in 'percentage' mode", () => {
    const result = processDataForChart(sampleData, "percentage");

    expect(result[0].gdp).toBe(0); // first point
    // (19000 - 21000) / 21000 * 100 = -9.523809...
    expect(Number(result[1].gdp)).toBeCloseTo(-9.5238, 2);
    // (21500 - 19000) / 19000 * 100 = 13.157894...
    expect(Number(result[2].gdp)).toBeCloseTo(13.1579, 2);
  });

  it("should compute cumulative net change from start in 'percentageChange' mode", () => {
    const result = processDataForChart(sampleData, "percentageChange");

    expect(result).toHaveLength(3);
    // First point is always 0 (base)
    expect(result[0].gdp).toBe(0);
    // (19000 - 21000) / 21000 * 100 = -9.523809...
    expect(Number(result[1].gdp)).toBeCloseTo(-9.5238, 2);
    // (21500 - 21000) / 21000 * 100 = 2.380952...
    expect(Number(result[2].gdp)).toBeCloseTo(2.381, 2);
  });

  it("should merge multiple indicators by date", () => {
    const result = processDataForChart(multiIndicatorData, "value");

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      date: "2020-01-01",
      gdp: 100,
      unemployment: 3.5,
    });
    expect(result[1]).toEqual({
      date: "2020-04-01",
      gdp: 110,
      unemployment: 14.7,
    });
  });

  it("should sort results by date ascending", () => {
    const unsortedData: TimeSeriesData[] = [
      {
        indicatorId: "gdp",
        indicatorName: "GDP",
        unit: "",
        data: [
          { date: "2020-07-01", value: 21500 },
          { date: "2020-01-01", value: 21000 },
          { date: "2020-04-01", value: 19000 },
        ],
      },
    ];

    const result = processDataForChart(unsortedData, "value");

    expect(result[0].date).toBe("2020-01-01");
    expect(result[1].date).toBe("2020-04-01");
    expect(result[2].date).toBe("2020-07-01");
  });

  it("should handle empty data", () => {
    const result = processDataForChart([], "value");
    expect(result).toHaveLength(0);
  });

  it("should handle indicators with different date ranges", () => {
    const mixedData: TimeSeriesData[] = [
      {
        indicatorId: "gdp",
        indicatorName: "GDP",
        unit: "",
        data: [
          { date: "2020-01-01", value: 100 },
          { date: "2020-04-01", value: 110 },
        ],
      },
      {
        indicatorId: "unemployment",
        indicatorName: "Unemployment",
        unit: "",
        data: [
          { date: "2020-04-01", value: 14.7 },
          { date: "2020-07-01", value: 10.2 },
        ],
      },
    ];

    const result = processDataForChart(mixedData, "value");

    // Should have 3 unique dates
    expect(result).toHaveLength(3);

    // First date only has gdp
    expect(result[0].date).toBe("2020-01-01");
    expect(result[0].gdp).toBe(100);
    expect(result[0].unemployment).toBeUndefined();

    // Middle date has both
    expect(result[1].date).toBe("2020-04-01");
    expect(result[1].gdp).toBe(110);
    expect(result[1].unemployment).toBe(14.7);

    // Last date only has unemployment
    expect(result[2].date).toBe("2020-07-01");
    expect(result[2].gdp).toBeUndefined();
    expect(result[2].unemployment).toBe(10.2);
  });
});
