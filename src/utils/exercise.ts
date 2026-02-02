/**
 * Exercise Utilities
 *
 * Generates exercise recommendations based on carb day type
 */

import { TCarbDayType } from '@/types/plan';
import {
  IExercisePlan,
  IExerciseCompletionStatus,
  IExerciseRecord,
  EXERCISE_TIPS_CN,
} from '@/types/exercise';

/**
 * Generate exercise plan for the day based on carb day type
 *
 * Rules:
 * - LOW/MEDIUM carb days: max 2 cardio sessions
 * - HIGH carb days: 20min post-workout cardio or none
 *
 * @param carbDayType - LOW, MEDIUM, or HIGH
 * @returns Exercise plan for the day
 */
export function generateExercisePlan(carbDayType: TCarbDayType): IExercisePlan {
  const tips = EXERCISE_TIPS_CN[carbDayType];

  if (carbDayType === 'HIGH') {
    return {
      carbDayType,
      strengthTrainingRecommended: true,
      maxCardioSessions: 1,
      cardioNotes: '高碳日: 力量训练后可做20分钟有氧, 或不做有氧',
      tips,
    };
  }

  if (carbDayType === 'MEDIUM') {
    return {
      carbDayType,
      strengthTrainingRecommended: true,
      maxCardioSessions: 2,
      cardioNotes: '中碳日: 可做最多2次有氧训练',
      tips,
    };
  }

  // LOW carb day
  return {
    carbDayType,
    strengthTrainingRecommended: true,
    maxCardioSessions: 2,
    cardioNotes: '低碳日: 可做最多2次有氧训练, 适合燃脂',
    tips,
  };
}

/**
 * Calculate exercise completion status
 * @param record - Exercise record (optional, may be null)
 * @param plan - Exercise plan for the day
 * @returns Completion status
 */
export function getExerciseCompletionStatus(
  record: IExerciseRecord | null | undefined,
  plan: IExercisePlan
): IExerciseCompletionStatus {
  if (!record) {
    return {
      strengthCompleted: false,
      cardioSessionsCompleted: 0,
      maxCardioSessions: plan.maxCardioSessions,
      totalMinutes: 0,
      isComplete: false,
    };
  }

  const cardioSessionsCompleted =
    (record.cardioSession1 ? 1 : 0) + (record.cardioSession2 ? 1 : 0);

  // Exercise is "complete" if strength training is done
  // Cardio is optional based on the day
  const isComplete = record.strengthCompleted;

  return {
    strengthCompleted: record.strengthCompleted,
    cardioSessionsCompleted,
    maxCardioSessions: plan.maxCardioSessions,
    totalMinutes: record.cardioMinutes ?? 0,
    isComplete,
  };
}

/**
 * Check if more cardio sessions are allowed
 */
export function canAddMoreCardio(
  currentSessions: number,
  maxSessions: number
): boolean {
  return currentSessions < maxSessions;
}

/**
 * Get exercise summary text in Chinese
 */
export function getExerciseSummaryCN(
  status: IExerciseCompletionStatus
): string {
  const parts: string[] = [];

  if (status.strengthCompleted) {
    parts.push('力量训练已完成');
  }

  if (status.cardioSessionsCompleted > 0) {
    parts.push(
      `有氧 ${status.cardioSessionsCompleted}/${status.maxCardioSessions} 次`
    );
    if (status.totalMinutes > 0) {
      parts.push(`共 ${status.totalMinutes} 分钟`);
    }
  }

  if (parts.length === 0) {
    return '今日运动未开始';
  }

  return parts.join(', ');
}
