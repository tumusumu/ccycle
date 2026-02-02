/**
 * BMI calculation utilities
 */

import { IBMIResult } from '@/types/user';

/**
 * Calculate BMI from weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): IBMIResult | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const value = Math.round(bmi * 10) / 10; // Round to 1 decimal

  let category: IBMIResult['category'];
  let categoryLabel: string;

  if (value < 18.5) {
    category = 'underweight';
    categoryLabel = '偏瘦';
  } else if (value < 24) {
    category = 'normal';
    categoryLabel = '正常';
  } else if (value < 28) {
    category = 'overweight';
    categoryLabel = '偏胖';
  } else {
    category = 'obese';
    categoryLabel = '肥胖';
  }

  return { value, category, categoryLabel };
}

/**
 * Get BMI category color for UI display
 */
export function getBMICategoryColor(category: IBMIResult['category']): string {
  switch (category) {
    case 'underweight':
      return '#7EC8E3'; // Light blue
    case 'normal':
      return '#5CB85C'; // Green
    case 'overweight':
      return '#F5C542'; // Yellow
    case 'obese':
      return '#E74C3C'; // Red
  }
}
