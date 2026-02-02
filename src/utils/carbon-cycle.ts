/**
 * Carbon Cycle Core Calculation Logic
 *
 * 112113 Pattern (fixed 6-day cycle):
 * Day 1: Low (1g/kg)
 * Day 2: Low (1g/kg)
 * Day 3: Medium (2g/kg) - 2x Low
 * Day 4: Low (1g/kg)
 * Day 5: Low (1g/kg)
 * Day 6: High (3g/kg) - 3x Low
 * Then Day 7 starts a new cycle...
 */

import { TCarbDayType } from '@/types/plan';
import { TGender } from '@/types/user';

/**
 * Fixed 112113 cycle pattern
 * 6-day cycle: Low, Low, Medium, Low, Low, High
 */
export const CYCLE_PATTERN: TCarbDayType[] = [
  'LOW',    // Day 1
  'LOW',    // Day 2
  'MEDIUM', // Day 3 (2x carbs)
  'LOW',    // Day 4
  'LOW',    // Day 5
  'HIGH',   // Day 6 (3x carbs)
];

export const CYCLE_LENGTH = 6;

/**
 * Carb multipliers per kg body weight
 */
export const CARB_MULTIPLIERS: Record<TCarbDayType, number> = {
  LOW: 1, // 1g carbs per kg body weight
  MEDIUM: 2, // 2g carbs per kg body weight (2x Low)
  HIGH: 3, // 3g carbs per kg body weight (3x Low)
};

/**
 * Get carb day type for a specific day number in the cycle
 * @param dayNumber - Day number starting from 1
 * @returns The carb day type (LOW, MEDIUM, or HIGH)
 */
export function getCarbDayType(dayNumber: number): TCarbDayType {
  const index = (dayNumber - 1) % CYCLE_LENGTH;
  return CYCLE_PATTERN[index];
}

/**
 * Get the position within the 6-day cycle pattern
 * @param dayNumber - Day number from start (1-based)
 * @returns Position in cycle (1-6)
 */
export function getPositionInCycle(dayNumber: number): number {
  return ((dayNumber - 1) % CYCLE_LENGTH) + 1;
}

/**
 * Calculate total carbs for the day
 * @param weight - Body weight in kg
 * @param carbDayType - LOW, MEDIUM, or HIGH
 * @returns Total carbs in grams
 */
export function calculateDailyCarbs(
  weight: number,
  carbDayType: TCarbDayType
): number {
  return Math.round(weight * CARB_MULTIPLIERS[carbDayType]);
}

/**
 * Calculate daily protein based on body fat percentage and gender
 *
 * Rules:
 * - Body fat >= 30%: Male 1.0g/kg, Female 0.75g/kg (avg of 0.7-0.8)
 * - Body fat ~25%: 1.5g/kg
 * - Body fat <= 20%: 2.0g/kg
 * - Body fat <= 15%: 2.5g/kg
 *
 * @param weight - Body weight in kg
 * @param bodyFatPercentage - Body fat as decimal (e.g., 0.25 for 25%)
 * @param gender - MALE or FEMALE
 * @returns Total protein in grams
 */
export function calculateDailyProtein(
  weight: number,
  bodyFatPercentage: number,
  gender: TGender
): number {
  let multiplier: number;

  if (bodyFatPercentage >= 0.3) {
    // >= 30% body fat
    multiplier = gender === 'MALE' ? 1.0 : 0.75;
  } else if (bodyFatPercentage >= 0.25) {
    // 25-30% body fat
    multiplier = 1.5;
  } else if (bodyFatPercentage >= 0.2) {
    // 20-25% body fat
    multiplier = 2.0;
  } else if (bodyFatPercentage >= 0.15) {
    // 15-20% body fat
    multiplier = 2.0;
  } else {
    // < 15% body fat
    multiplier = 2.5;
  }

  return Math.round(weight * multiplier);
}

/**
 * Calculate daily fat based on carb day type and body fat percentage
 *
 * Rules:
 * - HIGH carb day: 0 (strict zero fat)
 * - MEDIUM carb day: max 0.5g/kg
 * - LOW carb day:
 *   - Body fat >= 30%: Male 0.7g/kg, Female 0.6g/kg
 *   - Body fat 20-30%: ~1.0g/kg
 *   - Body fat < 20%: 1.0g/kg
 *
 * @param weight - Body weight in kg
 * @param bodyFatPercentage - Body fat as decimal
 * @param gender - MALE or FEMALE
 * @param carbDayType - LOW, MEDIUM, or HIGH
 * @returns Total fat in grams
 */
export function calculateDailyFat(
  weight: number,
  bodyFatPercentage: number,
  gender: TGender,
  carbDayType: TCarbDayType
): number {
  if (carbDayType === 'HIGH') {
    return 0; // Zero fat on high carb days
  }

  if (carbDayType === 'MEDIUM') {
    return Math.round(weight * 0.5);
  }

  // LOW carb day
  if (bodyFatPercentage >= 0.3) {
    // >= 30% body fat
    return Math.round(weight * (gender === 'MALE' ? 0.7 : 0.6));
  }

  // For body fat 20-30% and below
  return Math.round(weight * 1.0);
}

/**
 * Calculate water target based on weight
 *
 * Rules:
 * - Weight < 85kg: 4 liters
 * - Weight >= 85kg: 4.5 liters (or more)
 *
 * @param weight - Body weight in kg
 * @returns Water target in liters
 */
export function calculateWaterTarget(weight: number): number {
  return weight < 85 ? 4.0 : 4.5;
}

/**
 * Calculate day number within the current cycle from the start date
 * @param startDate - Plan start date
 * @param currentDate - Current date
 * @returns Day number (1-based)
 */
export function getDayNumberInCycle(
  startDate: Date,
  currentDate: Date
): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays + 1; // 1-based
}

/**
 * Check if it's allowed to use oil on this carb day type
 */
export function isOilAllowed(carbDayType: TCarbDayType): boolean {
  return carbDayType !== 'HIGH';
}

/**
 * Check if whole eggs are allowed on this carb day type
 */
export function isWholeEggAllowed(carbDayType: TCarbDayType): boolean {
  return carbDayType !== 'HIGH';
}

/**
 * Get carb day type display name in Chinese
 */
export function getCarbDayTypeName(carbDayType: TCarbDayType): string {
  const names: Record<TCarbDayType, string> = {
    LOW: '低碳日',
    MEDIUM: '中碳日',
    HIGH: '高碳日',
  };
  return names[carbDayType];
}

/**
 * Get the pattern name
 */
export function getPatternName(): string {
  return '112113模式 (低低中低低高)';
}

/**
 * Get pattern description
 */
export function getPatternDescription(): string {
  return '6天一循环: 低碳、低碳、中碳(2倍)、低碳、低碳、高碳(3倍)';
}

/**
 * Calculate cycle number for a given date
 * @param startDate - Plan start date
 * @param currentDate - Target date
 * @returns Cycle number (1-based)
 */
export function getCycleNumber(startDate: Date, currentDate: Date): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / CYCLE_LENGTH) + 1;
}

/**
 * Get day position in current cycle (1-6)
 * @param startDate - Plan start date
 * @param currentDate - Target date
 * @returns Day in cycle (1-6)
 */
export function getDayInCycle(startDate: Date, currentDate: Date): number {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const current = new Date(currentDate);
  current.setHours(0, 0, 0, 0);

  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return (diffDays % CYCLE_LENGTH) + 1;
}

/**
 * Get carb type for a specific date based on plan start
 * @param startDate - Plan start date
 * @param targetDate - Target date
 * @returns Carb day type
 */
export function getCarbTypeForDate(startDate: Date, targetDate: Date): TCarbDayType {
  const dayNumber = getDayNumberInCycle(startDate, targetDate);
  return getCarbDayType(dayNumber);
}

/**
 * Get cycle start date for a given cycle number
 * @param planStartDate - Plan start date
 * @param cycleNumber - Cycle number (1-based)
 * @returns Start date of that cycle
 */
export function getCycleStartDate(planStartDate: Date, cycleNumber: number): Date {
  const start = new Date(planStartDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + (cycleNumber - 1) * CYCLE_LENGTH);
  return start;
}
