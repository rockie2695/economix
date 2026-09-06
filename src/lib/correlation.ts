export interface CorrelationResult {
  indicatorA: string;
  indicatorB: string;
  coefficient: number;
  relationship: "strong_positive" | "moderate_positive" | "weak_positive" | "none" | "weak_negative" | "moderate_negative" | "strong_negative";
}

/**
 * Calculate Pearson correlation coefficient between two arrays of numbers.
 * Returns a value between -1 and 1.
 * - 1 = perfect positive correlation (direct proportion)
 * - 0 = no correlation
 * - -1 = perfect negative correlation (inverse proportion)
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2 || n !== y.length) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Interpret correlation coefficient into human-readable relationship type.
 */
export function interpretCorrelation(coefficient: number): CorrelationResult["relationship"] {
  const abs = Math.abs(coefficient);
  if (abs >= 0.7) return coefficient > 0 ? "strong_positive" : "strong_negative";
  if (abs >= 0.4) return coefficient > 0 ? "moderate_positive" : "moderate_negative";
  if (abs >= 0.2) return coefficient > 0 ? "weak_positive" : "weak_negative";
  return "none";
}

/**
 * Compute correlation matrix for all pairs of indicators.
 * Each indicator is identified by its key in the data.
 */
export function computeCorrelationMatrix(
  data: Record<string, (number | null | undefined)[]>,
  keys: string[]
): CorrelationResult[] {
  const results: CorrelationResult[] = [];

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = data[keys[i]];
      const b = data[keys[j]];
      if (!a || !b) continue;

      // Filter out null/undefined values (pairwise deletion)
      const pairs: [number, number][] = [];
      for (let k = 0; k < Math.min(a.length, b.length); k++) {
        if (a[k] != null && b[k] != null && !Number.isNaN(a[k]) && !Number.isNaN(b[k])) {
          pairs.push([a[k] as number, b[k] as number]);
        }
      }

      if (pairs.length < 2) continue;

      const x = pairs.map((p) => p[0]);
      const y = pairs.map((p) => p[1]);
      const coefficient = pearsonCorrelation(x, y);

      results.push({
        indicatorA: keys[i],
        indicatorB: keys[j],
        coefficient,
        relationship: interpretCorrelation(coefficient),
      });
    }
  }

  return results;
}
