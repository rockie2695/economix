import { describe, it, expect } from "vitest";
import {
  pearsonCorrelation,
  interpretCorrelation,
  computeCorrelationMatrix,
} from "@/lib/correlation";

describe("pearsonCorrelation", () => {
  it("should return 1 for perfectly positively correlated data", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10]; // y = 2x
    expect(pearsonCorrelation(x, y)).toBeCloseTo(1, 5);
  });

  it("should return -1 for perfectly negatively correlated data", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [10, 8, 6, 4, 2]; // y = -2x + 12
    expect(pearsonCorrelation(x, y)).toBeCloseTo(-1, 5);
  });

  it("should return 0 for uncorrelated data", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [3, 1, 4, 1, 5]; // no linear relationship
    const r = pearsonCorrelation(x, y);
    expect(Math.abs(r)).toBeLessThan(0.5);
  });

  it("should return 0 for empty arrays", () => {
    expect(pearsonCorrelation([], [])).toBe(0);
  });

  it("should return 0 for single-element arrays", () => {
    expect(pearsonCorrelation([1], [2])).toBe(0);
  });

  it("should return 0 for arrays of different lengths (not equal count)", () => {
    const x = [1, 2, 3];
    const y = [2, 4, 6, 8];
    // Our implementation checks n !== y.length, so different lengths return 0
    expect(pearsonCorrelation(x, y)).toBe(0);
  });
});

describe("interpretCorrelation", () => {
  it("should interpret strong positive", () => {
    expect(interpretCorrelation(0.9)).toBe("strong_positive");
    expect(interpretCorrelation(1.0)).toBe("strong_positive");
  });

  it("should interpret moderate positive", () => {
    expect(interpretCorrelation(0.5)).toBe("moderate_positive");
  });

  it("should interpret weak positive", () => {
    expect(interpretCorrelation(0.3)).toBe("weak_positive");
  });

  it("should interpret no correlation", () => {
    expect(interpretCorrelation(0.1)).toBe("none");
    expect(interpretCorrelation(-0.1)).toBe("none");
  });

  it("should interpret strong negative", () => {
    expect(interpretCorrelation(-0.9)).toBe("strong_negative");
  });

  it("should interpret moderate negative", () => {
    expect(interpretCorrelation(-0.5)).toBe("moderate_negative");
  });
});

describe("computeCorrelationMatrix", () => {
  it("should compute pairwise correlations", () => {
    const data: Record<string, number[]> = {
      gdp: [100, 110, 120, 130, 140],
      unemployment: [5, 4.5, 4, 3.5, 3], // inversely correlated
    };

    const results = computeCorrelationMatrix(data, ["gdp", "unemployment"]);
    expect(results).toHaveLength(1);
    expect(results[0].indicatorA).toBe("gdp");
    expect(results[0].indicatorB).toBe("unemployment");
    expect(results[0].coefficient).toBeCloseTo(-1, 5);
    expect(results[0].relationship).toBe("strong_negative");
  });

  it("should return empty for fewer than 2 indicators", () => {
    const data: Record<string, number[]> = {
      gdp: [100, 110, 120],
    };
    expect(computeCorrelationMatrix(data, ["gdp"])).toHaveLength(0);
  });

  it("should handle null values via pairwise deletion", () => {
    const data: Record<string, (number | null)[]> = {
      gdp: [100, 110, null, 130],
      unemployment: [5, 4.5, 4, 3.5],
    };
    const results = computeCorrelationMatrix(data, ["gdp", "unemployment"]);
    expect(results).toHaveLength(1);
    expect(results[0].coefficient).toBeDefined();
  });
});
