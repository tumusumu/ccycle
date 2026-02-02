/**
 * Cycle plan and daily meal plan type definitions
 *
 * 112113 Pattern (fixed 6-day cycle):
 * Day 1: Low (1g/kg)
 * Day 2: Low (1g/kg)
 * Day 3: Medium (2g/kg)
 * Day 4: Low (1g/kg)
 * Day 5: Low (1g/kg)
 * Day 6: High (3g/kg)
 * Then repeat...
 */

export type TCarbDayType = 'LOW' | 'MEDIUM' | 'HIGH';
export type TPlanStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type TProteinSource = 'CHICKEN' | 'BEEF' | 'SHRIMP';

export interface ICyclePlan {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  status: TPlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICyclePlanInput {
  startDate: string;
  cycleDays?: number; // 7-13 days, default 6 (one full 112113 cycle)
}

export interface IDailyMealPlan {
  id: string;
  cyclePlanId: string;
  date: Date;
  dayNumber: number; // 1-6 within cycle
  carbDayType: TCarbDayType;

  // Carb portions (grams of food)
  oatmealGrams: number;
  riceGramsLunch: number;
  riceGramsDinner: number;

  // Protein portions (grams of food) - 4 meals with individual sources
  proteinGramsMeal1: number;
  proteinSourceMeal1: TProteinSource;
  proteinGramsMeal2: number;
  proteinSourceMeal2: TProteinSource;
  proteinGramsMeal3: number;
  proteinSourceMeal3: TProteinSource;
  proteinGramsMeal4: number;
  proteinSourceMeal4: TProteinSource;

  // Fat allowance
  oliveoilMl: number;
  allowWholeEgg: boolean;

  // Water target
  waterLiters: number;

  createdAt: Date;
}

export interface IDailyMealPlanWithIntake extends IDailyMealPlan {
  intakeRecord?: {
    oatmealCompleted: boolean;
    riceLunchCompleted: boolean;
    riceDinnerCompleted: boolean;
    protein1Completed: boolean;
    protein2Completed: boolean;
    protein3Completed: boolean;
    protein4Completed: boolean;
    waterCompleted: boolean;
    followedPlan: boolean;
  };
}

export interface ICycleSummary {
  id: string;
  cyclePlanId: string;
  totalDays: number;
  daysFollowed: number;
  daysNotFollowed: number;
  startWeight: number;
  endWeight?: number;
  startBodyFat?: number;
  endBodyFat?: number;
  notFollowedDates: Date[];
  notes?: string;
  createdAt: Date;
}

export interface ICyclePlanWithProgress extends ICyclePlan {
  currentDay: number;
  totalDaysElapsed: number;
  completionPercentage: number;
  todaysMealPlan?: IDailyMealPlanWithIntake;
}
