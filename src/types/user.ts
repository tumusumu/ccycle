/**
 * User-related type definitions
 */

export type TGender = 'MALE' | 'FEMALE';

export interface IUserProfile {
  id: string;
  username: string;
  birthYear: number;
  gender: TGender;
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
  weight: number;
  bodyFatPercentage: number;
  goalType?: string;
}

export interface IUserProfileUpdate {
  gender?: TGender;
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
  createdAt: Date;
}

export interface IBodyMetricsInput {
  weight: number;
  bodyFatPercentage?: number;
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
