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
  oliveOilMl?: number;
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

  // Olive oil (橄榄油: ~0.9g fat per 1ml, 9 calories per ml)
  if (meal.oliveOilMl && meal.oliveOilMl > 0) {
    totalFat += meal.oliveOilMl * 0.9;
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
 *
 * 按照 CLAUDE.md 规范：
 * - 碳水：按总体重计算 (1g/kg 低碳日, 2g/kg 中碳日, 3g/kg 高碳日)
 * - 蛋白质：按总体重计算，根据体脂率调整系数
 * - 脂肪：按总体重计算，根据碳水日类型和体脂率调整
 */
export function calculateTargets(userData: IUserData, carbDayType: TCarbDayType): INutritionTargets {
  const weight = userData.weight;
  const bodyFat = userData.bodyFatPercentage;

  // 碳水目标：按总体重计算 (不是瘦体重！)
  // 低碳日: 1g/kg, 中碳日: 2g/kg, 高碳日: 3g/kg
  const carbMultiplier = carbDayType === 'LOW' ? 1 : carbDayType === 'MEDIUM' ? 2 : 3;
  const carbTarget = Math.round(weight * carbMultiplier);

  // 蛋白质目标：按总体重计算，根据体脂率调整系数
  // ≥30%: 1.0g/kg (男) / 0.75g/kg (女)
  // ~25%: 1.5g/kg
  // ≤20%: 2.0g/kg
  // ≤15%: 2.5g/kg
  let proteinMultiplier: number;
  if (bodyFat >= 0.30) {
    proteinMultiplier = userData.gender === 'FEMALE' ? 0.75 : 1.0;
  } else if (bodyFat >= 0.25) {
    proteinMultiplier = 1.5;
  } else if (bodyFat >= 0.20) {
    proteinMultiplier = 2.0;
  } else {
    proteinMultiplier = 2.5;
  }
  const proteinTarget = Math.round(weight * proteinMultiplier);

  // 脂肪目标：按总体重计算
  // 高碳日: 0 (尽量零脂)
  // 中碳日: 0.5g/kg 上限
  // 低碳日: 根据体脂率
  //   - 体脂≥30%: 男 0.7g/kg, 女 0.6g/kg
  //   - 体脂20-30%: 1.0g/kg
  //   - 体脂<20%: 1.0g/kg
  let fatMultiplier: number;
  if (carbDayType === 'HIGH') {
    fatMultiplier = 0;
  } else if (carbDayType === 'MEDIUM') {
    fatMultiplier = 0.5;
  } else {
    // LOW carb day
    if (bodyFat >= 0.30) {
      fatMultiplier = userData.gender === 'FEMALE' ? 0.6 : 0.7;
    } else {
      fatMultiplier = 1.0;
    }
  }
  const fatTarget = Math.round(weight * fatMultiplier);

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
  oliveOilMl: number; // 橄榄油（毫升）
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
    // 低碳日：需要较多脂肪（橄榄油）
    return {
      ...base,
      lunchRice: 80,
      snackRice: 40,
      dinnerRice: 60,
      oliveOilMl: 40, // 约36g脂肪
      strengthMin: 40,
      strengthMax: 50,
      cardioMin: 20,
      cardioMax: 30,
    };
  } else if (carbDayType === 'MEDIUM') {
    // 中碳日：适量脂肪
    return {
      ...base,
      lunchRice: 150,
      snackRice: 50,
      dinnerRice: 100,
      oliveOilMl: 25, // 约22g脂肪
      strengthMin: 45,
      strengthMax: 60,
      cardioMin: 30,
      cardioMax: 30,
    };
  } else {
    // HIGH - 高碳日：尽量零脂
    return {
      ...base,
      lunchRice: 220,
      snackRice: 0,
      dinnerRice: 180,
      oliveOilMl: 0, // 高碳日不用油
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
  lunchOliveOilMl: number;
  snackRiceGrams: number;
  snackMeatType: string;
  snackMeatGrams: number;
  dinnerRiceGrams: number;
  dinnerMeatType: string;
  dinnerMeatGrams: number;
  dinnerOliveOilMl: number;
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
      oliveOilMl: intake.lunchOliveOilMl,
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
      oliveOilMl: intake.dinnerOliveOilMl,
    },
  };
}
