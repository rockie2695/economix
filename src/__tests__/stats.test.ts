import { describe, it, expect } from "vitest";
import { calculateStats } from "@/components/Dashboard";
import type { TimeSeriesData } from "@/types";

describe("calculateStats", () => {
  it("should compute stats for a single data point", () => {
    const data: TimeSeriesData[] = [
      {
        indicatorId: "gdp",
        indicatorName: "GDP",
        unit: "Billions",
        data: [{ date: "2024-01-01", value: 28000 }],
      },
    ];

    const stats = calculateStats(data);

    expect(stats).toHaveLength(1);
    expect(stats[0].indicatorId).toBe("gdp");
    expect(stats[0].indicatorName).toBe("GDP");
    expect(stats[0].currentValue).toBe(28000);
    expect(stats[0].previousValue).toBeNull();
    expect(stats[0].change).toBe(0);
    expect(stats[0].changePercent).toBe(0);
    expect(stats[0].min).toBe(28000);
    expect(stats[0].max).toBe(28000);
    expect(stats[0].unit).toBe("Billions");
  });

  it("should compute correct change for multiple data points", () => {
    const data: TimeSeriesData[] = [
      {
        indicatorId: "unemployment",
        indicatorName: "Unemployment Rate",
        unit: "Percent",
        data: [
          { date: "2023-01-01", value: 3.5 },
          { date: "2023-02-01", value: 3.6 },
          { date: "2023-03-01", value: 3.5 },
        ],
      },
    ];

    const stats = calculateStats(data);

    expect(stats[0].currentValue).toBe(3.5); // last point
    expect(stats[0].previousValue).toBe(3.6); // second-to-last
    expect(stats[0].change).toBeCloseTo(-0.1, 5); // 3.5 - 3.6
    // -0.1 / 3.6 * 100 = -2.777...
    expect(stats[0].changePercent).toBeCloseTo(-2.7778, 2);
  });

  it("should compute min and max correctly", () => {
    const data: TimeSeriesData[] = [
      {
        indicatorId: "cpi",
        indicatorName: "CPI",
        unit: "Index",
        data: [
          { date: "2023-01-01", value: 300 },
          { date: "2023-02-01", value: 280 },
          { date: "2023-03-01", value: 310 },
          { date: "2023-04-01", value: 295 },
        ],
      },
    ];

    const stats = calculateStats(data);

    expect(stats[0].min).toBe(280);
    expect(stats[0].max).toBe(310);
  });

  it("should handle previousValue of 0 (division by zero)", () => {
    const data: TimeSeriesData[] = [
      {
        indicatorId: "test",
        indicatorName: "Test",
        unit: "",
        data: [
          { date: "2023-01-01", value: 0 },
          { date: "2023-02-01", value: 100 },
        ],
      },
    ];

    const stats = calculateStats(data);

    expect(stats[0].currentValue).toBe(100);
    expect(stats[0].previousValue).toBe(0);
    expect(stats[0].change).toBe(100);
    expect(stats[0].changePercent).toBe(0); // should not divide by zero
  });

  it("should compute stats for multiple indicators", () => {
    const data: TimeSeriesData[] = [
      {
        indicatorId: "gdp",
        indicatorName: "GDP",
        unit: "Billions",
        data: [
          { date: "2023-01-01", value: 27000 },
          { date: "2023-04-01", value: 28000 },
        ],
      },
      {
        indicatorId: "unemployment",
        indicatorName: "Unemployment Rate",
        unit: "Percent",
        data: [
          { date: "2023-01-01", value: 3.5 },
          { date: "2023-04-01", value: 3.4 },
        ],
      },
    ];

    const stats = calculateStats(data);

    expect(stats).toHaveLength(2);
    expect(stats[0].indicatorId).toBe("gdp");
    expect(stats[1].indicatorId).toBe("unemployment");
  });

  it("should handle empty data array", () => {
    const stats = calculateStats([]);
    expect(stats).toHaveLength(0);
  });

  it("should compute correct changePercent for positive change", () => {
    const data: TimeSeriesData[] = [
      {
        indicatorId: "test",
        indicatorName: "Test",
        unit: "",
        data: [
          { date: "2023-01-01", value: 100 },
          { date: "2023-02-01", value: 150 },
        ],
      },
    ];

    const stats = calculateStats(data);

    expect(stats[0].change).toBe(50);
    expect(stats[0].changePercent).toBe(50); // 50/100 * 100 = 50%
  });

  it("should compute correct changePercent for negative change", () => {
    const data: TimeSeriesData[] = [
      {
        indicatorId: "test",
        indicatorName: "Test",
        unit: "",
        data: [
          { date: "2023-01-01", value: 200 },
          { date: "2023-02-01", value: 150 },
        ],
      },
    ];

    const stats = calculateStats(data);

    expect(stats[0].change).toBe(-50);
    expect(stats[0].changePercent).toBeCloseTo(-25, 2); // -50/200 * 100 = -25%
  });
});
