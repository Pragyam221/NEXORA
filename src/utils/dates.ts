import { format, parseISO, subDays, differenceInCalendarDays, isValid } from 'date-fns';
import { DateRangeOption, DateRange } from '../types';

// The anchor reference date for deterministic mock data analysis is October 18, 2026
export const ANCHOR_DATE = '2026-10-18';

export function resolveDateRange(
  option: DateRangeOption,
  customRange?: { startDate: string; endDate: string }
): { current: DateRange; previous: DateRange } {
  const anchor = parseISO(ANCHOR_DATE);

  if (option === 'today') {
    const todayStr = ANCHOR_DATE;
    const yesterdayStr = format(subDays(anchor, 1), 'yyyy-MM-dd');
    return {
      current: { startDate: todayStr, endDate: todayStr },
      previous: { startDate: yesterdayStr, endDate: yesterdayStr },
    };
  }

  if (option === 'last7') {
    const currentEnd = ANCHOR_DATE;
    const currentStart = format(subDays(anchor, 6), 'yyyy-MM-dd');
    const prevEnd = format(subDays(anchor, 7), 'yyyy-MM-dd');
    const prevStart = format(subDays(anchor, 13), 'yyyy-MM-dd');
    return {
      current: { startDate: currentStart, endDate: currentEnd },
      previous: { startDate: prevStart, endDate: prevEnd },
    };
  }

  if (option === 'last30') {
    const currentEnd = ANCHOR_DATE;
    const currentStart = format(subDays(anchor, 29), 'yyyy-MM-dd');
    const prevEnd = format(subDays(anchor, 30), 'yyyy-MM-dd');
    const prevStart = format(subDays(anchor, 59), 'yyyy-MM-dd');
    return {
      current: { startDate: currentStart, endDate: currentEnd },
      previous: { startDate: prevStart, endDate: prevEnd },
    };
  }

  // Custom range
  if (customRange && customRange.startDate && customRange.endDate) {
    const start = parseISO(customRange.startDate);
    const end = parseISO(customRange.endDate);
    if (isValid(start) && isValid(end) && end >= start) {
      const days = differenceInCalendarDays(end, start) + 1;
      const prevEnd = format(subDays(start, 1), 'yyyy-MM-dd');
      const prevStart = format(subDays(start, days), 'yyyy-MM-dd');
      return {
        current: { startDate: customRange.startDate, endDate: customRange.endDate },
        previous: { startDate: prevStart, endDate: prevEnd },
      };
    }
  }

  // Fallback to last 30
  return resolveDateRange('last30');
}

export function isDateInRange(dateStr: string, startDateStr: string, endDateStr: string): boolean {
  if (!dateStr) return false;
  // Clean dateStr to YYYY-MM-DD
  const dateOnly = dateStr.slice(0, 10);
  return dateOnly >= startDateStr && dateOnly <= endDateStr;
}

export function formatDateCustom(dateStr: string, pattern: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' = 'DD/MM/YYYY'): string {
  if (!dateStr) return '-';
  try {
    const dateObj = parseISO(dateStr.slice(0, 10));
    if (!isValid(dateObj)) return dateStr;
    if (pattern === 'DD/MM/YYYY') return format(dateObj, 'dd/MM/yyyy');
    if (pattern === 'MM/DD/YYYY') return format(dateObj, 'MM/dd/yyyy');
    return format(dateObj, 'yyyy-MM-dd');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-';
  try {
    const dateObj = parseISO(isoString);
    if (!isValid(dateObj)) return isoString;
    return format(dateObj, 'dd MMM yyyy, HH:mm');
  } catch {
    return isoString;
  }
}
