/**
 * Daily intake record type definitions
 */

export interface IDailyIntakeRecord {
  id: string;
  dailyMealPlanId: string;

  // Check-off items
  oatmealCompleted: boolean;
  riceLunchCompleted: boolean;
  riceDinnerCompleted: boolean;
  protein1Completed: boolean;
  protein2Completed: boolean;
  protein3Completed: boolean;
  protein4Completed: boolean;
  waterCompleted: boolean;

  // Compliance
  followedPlan: boolean;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type TIntakeItemKey =
  | 'oatmealCompleted'
  | 'riceLunchCompleted'
  | 'riceDinnerCompleted'
  | 'protein1Completed'
  | 'protein2Completed'
  | 'protein3Completed'
  | 'protein4Completed'
  | 'waterCompleted';

export interface IIntakeCheckItem {
  itemKey: TIntakeItemKey;
  completed: boolean;
}

export interface IIntakeUpdate {
  itemKey: TIntakeItemKey;
  completed: boolean;
}

export interface IMarkDayComplete {
  followedPlan: boolean;
  notes?: string;
}

export interface IDailyCompletionStatus {
  totalItems: number;
  completedItems: number;
  percentage: number;
  isComplete: boolean;
  items: {
    key: TIntakeItemKey;
    label: string;
    completed: boolean;
  }[];
}

/**
 * Intake item labels (Chinese)
 */
export const INTAKE_LABELS_CN: Record<TIntakeItemKey, string> = {
  oatmealCompleted: '早餐燕麦',
  riceLunchCompleted: '午餐米饭',
  riceDinnerCompleted: '晚餐米饭',
  protein1Completed: '早餐蛋白质',
  protein2Completed: '午餐蛋白质',
  protein3Completed: '加餐蛋白质',
  protein4Completed: '晚餐蛋白质',
  waterCompleted: '饮水达标',
};
