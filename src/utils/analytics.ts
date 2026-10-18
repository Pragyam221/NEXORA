import { MetricComparison } from '../types';

/**
 * Calculates absolute and percentage change between current and previous periods.
 * Handles zero values safely ("New" or null percentage) without returning NaN or Infinity.
 */
export function calculateComparison(
  currentValue: number,
  previousValue: number,
  higherIsBetter: boolean = true
): MetricComparison {
  const absoluteChange = currentValue - previousValue;

  let percentageChange: number | null = null;
  if (previousValue !== 0) {
    percentageChange = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  } else if (currentValue !== 0) {
    // If previous was 0 and current > 0, percentageChange is null (will display "New")
    percentageChange = null;
  } else {
    percentageChange = 0;
  }

  const isNeutral = absoluteChange === 0;
  const isPositive = higherIsBetter ? absoluteChange > 0 : absoluteChange < 0;

  return {
    currentValue,
    previousValue,
    absoluteChange,
    percentageChange,
    isPositive,
    isNeutral,
  };
}

/**
 * Formats a metric comparison for display
 */
export function formatComparisonBadge(comparison: MetricComparison, suffix: string = '%'): {
  text: string;
  className: string;
} {
  if (comparison.isNeutral) {
    return {
      text: '0.0% vs prev',
      className: 'bg-navy-800 text-text-secondary border-navy-700',
    };
  }

  if (comparison.percentageChange === null) {
    return {
      text: 'New',
      className: 'bg-status-info/10 text-status-info border-status-info/30',
    };
  }

  const sign = comparison.percentageChange > 0 ? '+' : '';
  const formatted = `${sign}${comparison.percentageChange.toFixed(1)}${suffix} vs prev`;

  if (comparison.isPositive) {
    return {
      text: formatted,
      className: 'bg-status-success/10 text-status-success border-status-success/30',
    };
  } else {
    return {
      text: formatted,
      className: 'bg-status-danger/10 text-status-danger border-status-danger/30',
    };
  }
}
