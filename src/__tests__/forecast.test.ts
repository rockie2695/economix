import { describe, it, expect } from "vitest";
import { linearRegression, movingAverage, forecast } from "@/lib/forecast";

describe("linearRegression", () => {
  it("should compute slope and intercept for linear data", () => {
    const x = [0, 1, 2, 3, 4];
    const y = [0, 2, 4, 6, 8]; // y = 2x
    const result = linearRegression(x, y);

    expect(result.slope).toBeCloseTo(2, 5);
    expect(result.intercept).toBeCloseTo(0, 5);
    expect(result.rSquared).toBeCloseTo(1, 5);
  });

  it("should return 0 slope for constant data", () => {
    const x = [0, 1, 2, 3];
    const y = [5, 5, 5, 5];
    const result = linearRegression(x, y);

    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(5);
  });

  it("should handle empty data", () => {
    const result = linearRegression([], []);
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(0);
    expect(result.rSquared).toBe(0);
  });

  it("should compute R² for noisy data", () => {
    const x = [0, 1, 2, 3, 4];
    const y = [0.1, 1.9, 4.1, 5.9, 8.2]; // approximately y = 2x
    const result = linearRegression(x, y);
    expect(result.rSquared).toBeGreaterThan(0.99);
  });
});

describe("movingAverage", () => {
  it("should compute 3-period moving average", () => {
    const data = [10, 20, 30, 40, 50];
    const result = movingAverage(data, 3);

    expect(result[0]).toBeNull();
    expect(result[1]).toBeNull();
    expect(result[2]).toBeCloseTo(20, 5); // (10+20+30)/3
    expect(result[3]).toBeCloseTo(30, 5); // (20+30+40)/3
    expect(result[4]).toBeCloseTo(40, 5); // (30+40+50)/3
  });

  it("should return all null for window larger than data", () => {
    const data = [10, 20];
    const result = movingAverage(data, 5);
    expect(result.every((v) => v === null)).toBe(true);
  });

  it("should return exact values for window of 1", () => {
    const data = [10, 20, 30];
    const result = movingAverage(data, 1);
    expect(result).toEqual([10, 20, 30]);
  });
});

describe("forecast", () => {
  it("should extrapolate linear trend", () => {
    const values = [10, 20, 30, 40]; // linear increase
    const result = forecast(values, 4);

    // Should have original 4 values + 4 forecasted
    expect(result).toHaveLength(8);

    // Original values should be preserved
    expect(result[0]).toBe(10);
    expect(result[1]).toBe(20);
    expect(result[2]).toBe(30);
    expect(result[3]).toBe(40);

    // Forecasted values should continue the trend (approximately +10 per period)
    expect(result[4]).toBeCloseTo(50, 0);
    expect(result[5]).toBeCloseTo(60, 0);
    expect(result[6]).toBeCloseTo(70, 0);
    expect(result[7]).toBeCloseTo(80, 0);
  });

  it("should return original values when periods is 0", () => {
    const values = [10, 20, 30];
    const result = forecast(values, 0);
    expect(result).toEqual([10, 20, 30]);
  });
});
