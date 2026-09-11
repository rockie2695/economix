/**
 * Linear regression utilities for forecasting and trend analysis.
 */

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
}

/**
 * Perform simple linear regression on paired data.
 * Returns slope, intercept, and R² value.
 */
export function linearRegression(x: number[], y: number[]): LinearRegressionResult {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let ssXY = 0;
  let ssXX = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    ssXY += dx * dy;
    ssXX += dx * dx;
    ssTot += dy * dy;
  }

  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = meanY - slope * meanX;

  // R² = 1 - SS_res / SS_tot
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * x[i] + intercept;
    ssRes += (y[i] - predicted) ** 2;
  }
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
}

/**
 * Compute moving average for a numeric array.
 * Returns null for positions where there aren't enough prior data points.
 */
export function movingAverage(data: number[], windowSize: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - windowSize + 1; j <= i; j++) {
        sum += data[j];
      }
      result.push(sum / windowSize);
    }
  }
  return result;
}

/**
 * Generate forecast values by extrapolating the linear trend.
 * @param values - historical values
 * @param periods - number of future periods to forecast
 * @returns array of forecast values (historical + future)
 */
export function forecast(values: number[], periods: number): (number | null)[] {
  const x = values.map((_, i) => i);
  const { slope, intercept } = linearRegression(x, values);

  const result: (number | null)[] = [...values];
  for (let i = 1; i <= periods; i++) {
    result.push(slope * (values.length + i - 1) + intercept);
  }
  return result;
}
