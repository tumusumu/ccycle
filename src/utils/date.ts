/**
 * Date Utilities
 */

/**
 * Format date to YYYY-MM-DD string (local timezone)
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string (YYYY-MM-DD) to Date object at local midnight
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Get today's date at midnight (local time)
 */
export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return formatDate(new Date());
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get the number of days between two dates
 */
export function getDaysBetween(start: Date, end: Date): number {
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if date1 is before date2
 */
export function isBefore(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() < d2.getTime();
}

/**
 * Check if date1 is after date2
 */
export function isAfter(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() > d2.getTime();
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const s = new Date(start);
  s.setHours(0, 0, 0, 0);

  const e = new Date(end);
  e.setHours(0, 0, 0, 0);

  return d.getTime() >= s.getTime() && d.getTime() <= e.getTime();
}

/**
 * Get an array of dates from start to end (inclusive)
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current.getTime() <= endDate.getTime()) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Format date for display in Chinese
 * @param date - Date to format
 * @param format - 'short' (MM-DD) or 'long' (YYYY年MM月DD日)
 */
export function formatDateCN(
  date: Date,
  format: 'short' | 'long' = 'short'
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (format === 'long') {
    return `${year}年${month}月${day}日`;
  }

  return `${month}-${day}`;
}

/**
 * Get weekday name in Chinese
 */
export function getWeekdayCN(date: Date): string {
  const weekdays = [
    '周日',
    '周一',
    '周二',
    '周三',
    '周四',
    '周五',
    '周六',
  ];
  return weekdays[date.getDay()];
}

/**
 * Get relative date description in Chinese
 */
export function getRelativeDateCN(date: Date): string {
  const today = getToday();
  const diff = getDaysBetween(today, date);

  if (diff === 0) return '今天';
  if (diff === 1) return '明天';
  if (diff === -1) return '昨天';
  if (diff > 1 && diff <= 7) return `${diff}天后`;
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)}天前`;

  return formatDateCN(date);
}
