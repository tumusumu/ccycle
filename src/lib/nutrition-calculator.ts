/**
 * Centralized Nutrition Calculator Module
 * All nutrition calculation logic in one place
 */

import {
  NUTRITION_PER_100G,
  EGG_NUTRITION,
  INutritionData,
} from '@/constants/nutrition';
import { TCarbDayType } from '@/types/plan';

// Extended nutrition data with calories
export interface INutritionWithCalories extends INutritionData {
  calories: number;
}

// User data for target calculation
export interface IUserData {
  weight: number;
  bodyFatPercentage: number;
  gender?: 'MALE' | 'FEMALE';
}

// Daily nutrition targets
export interface INutritionTargets {
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  water: number; // in ml
}

// Meal data for calculation
export interface IMealData {
  oatmealGrams?: number;
  wholeEggs?: number;
  whiteOnlyEggs?: number;
  riceGrams?: number;
  meatType?: string;
  meatGrams?: number;
}

// All meals for daily calculation
export interface IDailyMealsData {
  breakfast: IMealData;
  lunch: IMealData;
  snack: IMealData;
  dinner: IMealData;
}

/**
 * Calculate calories from macros
 * Protein: 4 cal/g, Fat: 9 cal/g, Carbs: 4 cal/g
 */
export function calculateCalories(protein: number, fat: number, carbs: number): number {
  return Math.round(protein * 4 + fat * 9 + carbs * 4);
}

/**
 * Calculate nutrition for a single food item
 */
export function calculateFoodNutrition(foodKey: string, grams: number): INutritionWithCalories {
  const data = NUTRITION_PER_100G[foodKey];
  if (!data || grams <= 0) {
    return { protein: 0, fat: 0, carbs: 0, calories: 0 };
  }

  const ratio = grams / 100;
  const protein = Math.round(data.protein * ratio * 10) / 10;
  const fat = Math.round(data.fat * ratio * 10) / 10;
  const carbs = Math.round(data.carbs * ratio * 10) / 10;
  const calories = calculateCalories(protein, fat, carbs);

  return { protein, fat, carbs, calories };
}

/**
 * Calculate nutrition for eggs
 */
export function calculateEggsNutrition(wholeEggs: number, whiteOnlyEggs: number): INutritionWithCalories {
  const whole = EGG_NUTRITION.whole;
  const white = EGG_NUTRITION.white;

  const protein = Math.round((whole.protein * wholeEggs + white.protein * whiteOnlyEggs) * 10) / 10;
  const fat = Math.round((whole.fat * wholeEggs + white.fat * whiteOnlyEggs) * 10) / 10;
  const carbs = 0;
  const calories = calculateCalories(protein, fat, carbs);

  return { protein, fat, carbs, calories };
}

/**
 * Calculate nutrition for a single meal
 */
export function calculateMealNutrition(meal: IMealData): INutritionWithCalories {
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  // Oatmeal
  if (meal.oatmealGrams && meal.oatmealGrams > 0) {
    const oatmeal = calculateFoodNutrition('oatmeal', meal.oatmealGrams);
    totalProtein += oatmeal.protein;
    totalFat += oatmeal.fat;
    totalCarbs += oatmeal.carbs;
  }

  // Eggs
  if ((meal.wholeEggs && meal.wholeEggs > 0) || (meal.whiteOnlyEggs && meal.whiteOnlyEggs > 0)) {
    const eggs = calculateEggsNutrition(meal.wholeEggs || 0, meal.whiteOnlyEggs || 0);
    totalProtein += eggs.protein;
    totalFat += eggs.fat;
    totalCarbs += eggs.carbs;
  }

  // Rice
  if (meal.riceGrams && meal.riceGrams > 0) {
    const rice = calculateFoodNutrition('rice', meal.riceGrams);
    totalProtein += rice.protein;
    totalFat += rice.fat;
    totalCarbs += rice.carbs;
  }

  // Meat / Protein source
  if (meal.meatType && meal.meatGrams && meal.meatGrams > 0) {
    const meat = calculateFoodNutrition(meal.meatType, meal.meatGrams);
    totalProtein += meat.protein;
    totalFat += meat.fat;
    totalCarbs += meat.carbs;
  }

  return {
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    calories: calculateCalories(totalProtein, totalFat, totalCarbs),
  };
}

/**
 * Calculate total daily nutrition from all meals
 */
export function calculateDailyNutrition(meals: IDailyMealsData): INutritionWithCalories {
  const breakfast = calculateMealNutrition(meals.breakfast);
  const lunch = calculateMealNutrition(meals.lunch);
  const snack = calculateMealNutrition(meals.snack);
  const dinner = calculateMealNutrition(meals.dinner);

  const totalProtein = breakfast.protein + lunch.protein + snack.protein + dinner.protein;
  const totalFat = breakfast.fat + lunch.fat + snack.fat + dinner.fat;
  const totalCarbs = breakfast.carbs + lunch.carbs + snack.carbs + dinner.carbs;

  return {
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    calories: calculateCalories(totalProtein, totalFat, totalCarbs),
  };
}

/**
 * Calculate lean body mass
 */
export function calculateLeanMass(weight: number, bodyFatPercentage: number): number {
  return weight * (1 - bodyFatPercentage);
}

/**
 * Calculate daily nutrition targets based on user data and carb day type
 */
export function calculateTargets(userData: IUserData, carbDayType: TCarbDayType): INutritionTargets {
  const leanMass = calculateLeanMass(userData.weight, userData.bodyFatPercentage);

  // Carb target: 1g/kg (LOW), 2g/kg (MEDIUM), 3g/kg (HIGH) of lean mass
  const carbMultiplier = carbDayType === 'LOW' ? 1 : carbDayType === 'MEDIUM' ? 2 : 3;
  const carbTarget = Math.round(leanMass * carbMultiplier);

  // Protein target: based on body fat percentage
  // ≥30%: 1.0g/kg, ~25%: 1.5g/kg, ≤20%: 2.0g/kg, ≤15%: 2.5g/kg
  let proteinMultiplier: number;
  if (userData.bodyFatPercentage >= 0.30) {
    proteinMultiplier = 1.0;
  } else if (userData.bodyFatPercentage >= 0.25) {
    proteinMultiplier = 1.5;
  } else if (userData.bodyFatPercentage >= 0.20) {
    proteinMultiplier = 2.0;
  } else {
    proteinMultiplier = 2.5;
  }
  // For females at high body fat, use slightly lower
  if (userData.gender === 'FEMALE' && userData.bodyFatPercentage >= 0.30) {
    proteinMultiplier = 0.75;
  }
  const proteinTarget = Math.round(userData.weight * proteinMultiplier);

  // Fat target: inversely related to carb day
  // LOW: 0.8g/kg, MEDIUM: 0.5g/kg, HIGH: 0.3g/kg of lean mass
  const fatMultiplier = carbDayType === 'LOW' ? 0.8 : carbDayType === 'MEDIUM' ? 0.5 : 0.3;
  const fatTarget = Math.round(leanMass * fatMultiplier);

  // Calculate calorie target
  const calorieTarget = calculateCalories(proteinTarget, fatTarget, carbTarget);

  // Water target: 4L for <85kg, 4L+ for ≥85kg
  const waterTarget = userData.weight >= 85 ? 4500 : 4000;

  return {
    protein: proteinTarget,
    fat: fatTarget,
    carbs: carbTarget,
    calories: calorieTarget,
    water: waterTarget,
  };
}

/**
 * Get reference portions based on carb day type
 */
export interface IReferencePortions {
  oatmeal: number;
  wholeEggs: number;
  whiteOnlyEggs: number;
  lunchRice: number;
  lunchMeat: number;
  snackRice: number;
  snackMeat: number;
  dinnerRice: number;
  dinnerMeat: number;
  strengthMin: number;
  strengthMax: number;
  cardioMin: number;
  cardioMax: number;
}

export function getReferencePortions(carbDayType: TCarbDayType): IReferencePortions {
  const base = {
    oatmeal: 40,
    wholeEggs: 2,
    whiteOnlyEggs: 1,
    lunchMeat: 100,
    snackMeat: 100,
    dinnerMeat: 100,
  };

  if (carbDayType === 'LOW') {
    return {
      ...base,
      lunchRice: 80,
      snackRice: 40,
      dinnerRice: 60,
      strengthMin: 40,
      strengthMax: 50,
      cardioMin: 20,
      cardioMax: 30,
    };
  } else if (carbDayType === 'MEDIUM') {
    return {
      ...base,
      lunchRice: 150,
      snackRice: 50,
      dinnerRice: 100,
      strengthMin: 45,
      strengthMax: 60,
      cardioMin: 30,
      cardioMax: 30,
    };
  } else {
    // HIGH - snack has no rice
    return {
      ...base,
      lunchRice: 220,
      snackRice: 0,
      dinnerRice: 180,
      strengthMin: 60,
      strengthMax: 60,
      cardioMin: 30,
      cardioMax: 45,
    };
  }
}

/**
 * Convert intake context data to daily meals data
 */
export function intakeToMealsData(intake: {
  oatmealGrams: number;
  wholeEggs: number;
  whiteOnlyEggs: number;
  lunchRiceGrams: number;
  lunchMeatType: string;
  lunchMeatGrams: number;
  snackRiceGrams: number;
  snackMeatType: string;
  snackMeatGrams: number;
  dinnerRiceGrams: number;
  dinnerMeatType: string;
  dinnerMeatGrams: number;
}): IDailyMealsData {
  return {
    breakfast: {
      oatmealGrams: intake.oatmealGrams,
      wholeEggs: intake.wholeEggs,
      whiteOnlyEggs: intake.whiteOnlyEggs,
    },
    lunch: {
      riceGrams: intake.lunchRiceGrams,
      meatType: intake.lunchMeatType,
      meatGrams: intake.lunchMeatGrams,
    },
    snack: {
      riceGrams: intake.snackRiceGrams,
      meatType: intake.snackMeatType,
      meatGrams: intake.snackMeatGrams,
    },
    dinner: {
      riceGrams: intake.dinnerRiceGrams,
      meatType: intake.dinnerMeatType,
      meatGrams: intake.dinnerMeatGrams,
    },
  };
}
