/**
 * Format a number into Indian Rupee format (INR)
 * Handles full Indian number grouping (e.g. ₹1,25,000) or compact formatting (e.g. ₹1.25 L, ₹2.40 Cr)
 */
export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (compact) {
    if (absAmount >= 10000000) {
      const cr = (absAmount / 10000000).toFixed(2);
      return `${isNegative ? '-' : ''}₹${cr} Cr`;
    }
    if (absAmount >= 100000) {
      const lakh = (absAmount / 100000).toFixed(2);
      return `${isNegative ? '-' : ''}₹${lakh} L`;
    }
    if (absAmount >= 1000) {
      const k = (absAmount / 1000).toFixed(1);
      return `${isNegative ? '-' : ''}₹${k} k`;
    }
    return `${isNegative ? '-' : ''}₹${absAmount.toLocaleString('en-IN')}`;
  }

  // Full Indian currency formatting with commas
  return `${isNegative ? '-' : ''}₹${absAmount.toLocaleString('en-IN')}`;
}

export function parseINR(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}
