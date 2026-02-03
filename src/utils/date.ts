/**
 * Date Utilities
 *
 * 核心原则：
 * - 用户看到的日期始终是本地时间
 * - 每天午夜零点换天（跟随设备时区）
 * - 存储到数据库时使用 UTC 午夜，确保日期不会因时区转换而偏移
 */

/**
 * Format date to YYYY-MM-DD string (using local timezone)
 * 用于显示给用户看的日期
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date from database (which is stored at UTC midnight) to YYYY-MM-DD string
 * 用于从数据库读取的日期（PostgreSQL DATE 返回 UTC 午夜）
 */
export function formatDateFromDb(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string (YYYY-MM-DD) to Date object for database storage
 * 创建 UTC 午夜的 Date，确保存入数据库时日期不变
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Get today's date for database storage/comparison
 * 获取今天的日期，基于用户本地时间判断"今天"，返回 UTC 午夜用于数据库
 */
export function getToday(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * Get today's date as YYYY-MM-DD string (local timezone)
 */
export function getTodayString(): string {
  return formatDate(new Date());
}

/**
 * Add days to a date (preserves UTC midnight for DB dates)
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get the number of days between two dates (both should be UTC midnight)
 */
export function getDaysBetween(start: Date, end: Date): number {
  // 使用 UTC 时间计算，避免夏令时等问题
  const startTime = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const endTime = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate()
  );
  return Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24));
}

/**
 * Check if two dates are the same day (comparing UTC dates)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateFromDb(date1) === formatDateFromDb(date2);
}

/**
 * Check if a date (from DB) is today (local time)
 */
export function isToday(date: Date): boolean {
  return formatDateFromDb(date) === getTodayString();
}

/**
 * Check if date1 is before date2 (comparing UTC dates)
 */
export function isBefore(date1: Date, date2: Date): boolean {
  return getDaysBetween(date1, date2) > 0;
}

/**
 * Check if date1 is after date2 (comparing UTC dates)
 */
export function isAfter(date1: Date, date2: Date): boolean {
  return getDaysBetween(date1, date2) < 0;
}

/**
 * Check if a date is within a range (inclusive, comparing UTC dates)
 */
export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const d = getDaysBetween(start, date);
  const e = getDaysBetween(start, end);
  return d >= 0 && d <= e;
}

/**
 * Get an array of dates from start to end (inclusive)
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const totalDays = getDaysBetween(start, end);

  for (let i = 0; i <= totalDays; i++) {
    dates.push(addDays(start, i));
  }

  return dates;
}

/**
 * Format date for display in Chinese
 * @param date - Date to format (from DB, UTC midnight)
 * @param format - 'short' (MM-DD) or 'long' (YYYY年MM月DD日)
 */
export function formatDateCN(
  date: Date,
  format: 'short' | 'long' = 'short'
): string {
  const dateStr = formatDateFromDb(date);
  const [year, month, day] = dateStr.split('-');

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
  return weekdays[date.getUTCDay()];
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
