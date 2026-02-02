/**
 * User-related type definitions
 */

export type TGender = 'MALE' | 'FEMALE';

export interface IUserProfile {
  id: string;
  username: string;
  birthYear: number;
  gender: TGender;
  height?: number; // cm - for BMI calculation
  weight: number; // kg
  bodyFatPercentage: number; // decimal 0-1 (e.g., 0.25 = 25%)
  goalType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfileInput {
  username: string;
  birthYear: number;
  gender: TGender;
  height?: number; // cm
  weight: number;
  bodyFatPercentage: number;
  goalType?: string;
}

export interface IUserProfileUpdate {
  gender?: TGender;
  height?: number; // cm
  weight?: number;
  bodyFatPercentage?: number;
  goalType?: string;
}

export interface IBodyMetrics {
  id: string;
  userId: string;
  date: Date;
  weight: number;
  bodyFatPercentage?: number;
  muscleMass?: number; // kg
  waistCircumference?: number; // cm
  note?: string;
  createdAt: Date;
}

export interface IBodyMetricsInput {
  weight: number;
  bodyFatPercentage?: number;
  muscleMass?: number; // kg
  waistCircumference?: number; // cm
  note?: string;
  date?: Date; // defaults to today
}

export interface IBodyMetricsHistory {
  metrics: IBodyMetrics[];
  startWeight: number;
  currentWeight: number;
  weightChange: number;
  startBodyFat?: number;
  currentBodyFat?: number;
  bodyFatChange?: number;
}

// Goal types
export type TGoalType = 'WEIGHT' | 'BODY_FAT' | 'MUSCLE_MASS';
export type TGoalStatus = 'ACTIVE' | 'ACHIEVED' | 'CANCELLED';

export interface IMetricGoal {
  id: string;
  userId: string;
  goalType: TGoalType;
  targetValue: number;
  startValue: number;
  startDate: Date;
  targetDate?: Date;
  achievedAt?: Date;
  status: TGoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMetricGoalInput {
  goalType: TGoalType;
  targetValue: number;
  startValue: number;
  targetDate?: Date;
}

export interface IMetricGoalUpdate {
  targetValue?: number;
  targetDate?: Date;
  status?: TGoalStatus;
}

// BMI calculation helper types
export interface IBMIResult {
  value: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  categoryLabel: string; // Chinese label
}
