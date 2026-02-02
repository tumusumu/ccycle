/**
 * Exercise record and plan type definitions
 */

import { TCarbDayType } from './plan';

export interface IExerciseRecord {
  id: string;
  userId: string;
  date: Date;
  strengthCompleted: boolean;
  cardioSession1: boolean;
  cardioSession2: boolean;
  cardioMinutes: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExerciseRecordInput {
  strengthCompleted?: boolean;
  cardioSession1?: boolean;
  cardioSession2?: boolean;
  cardioMinutes?: number;
  notes?: string;
}

export interface IExercisePlan {
  carbDayType: TCarbDayType;
  strengthTrainingRecommended: boolean;
  maxCardioSessions: number; // 2 for low/medium, 0-1 for high
  cardioNotes: string;
  tips: string[];
}

export interface IExerciseCompletionStatus {
  strengthCompleted: boolean;
  cardioSessionsCompleted: number;
  maxCardioSessions: number;
  totalMinutes: number;
  isComplete: boolean;
}

/**
 * Exercise labels (Chinese)
 */
export const EXERCISE_LABELS_CN = {
  STRENGTH: '力量训练',
  CARDIO: '有氧训练',
  CARDIO_SESSION_1: '有氧训练 1',
  CARDIO_SESSION_2: '有氧训练 2',
} as const;

/**
 * Exercise tips by carb day type (Chinese)
 */
export const EXERCISE_TIPS_CN: Record<TCarbDayType, string[]> = {
  LOW: [
    '低碳日适合做有氧运动',
    '可以进行最多2次有氧训练',
    '力量训练时缩短组间休息',
  ],
  MEDIUM: [
    '中碳日适合力量训练',
    '可以进行最多2次有氧训练',
    '注意补充足够水分',
  ],
  HIGH: [
    '高碳日以力量训练为主',
    '练后可做20分钟有氧,或不做',
    '利用高碳水提升训练强度',
  ],
};
