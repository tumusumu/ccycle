/**
 * Nutrition Calculation Utilities
 *
 * Converts macro targets to actual food portions
 */

import { TProteinSource, TCarbDayType } from '@/types/plan';
import { TGender } from '@/types/user';
import {
  IMealPortion,
  IDailyNutritionPlan,
  IFoodRestrictions,
  FOOD_CARB_CONTENT,
  FOOD_PROTEIN_CONTENT,
  OLIVE_OIL_FAT_CONTENT,
  CALORIES_PER_GRAM,
} from '@/types/nutrition';

/**
 * Available protein sources for random assignment
 */
const PROTEIN_SOURCES: TProteinSource[] = ['CHICKEN', 'BEEF', 'SHRIMP'];

/**
 * Get a random protein source
 */
export function getRandomProteinSource(): TProteinSource {
  return PROTEIN_SOURCES[Math.floor(Math.random() * PROTEIN_SOURCES.length)];
}
import {
  calculateDailyCarbs,
  calculateDailyProtein,
  calculateDailyFat,
  calculateWaterTarget,
  isOilAllowed,
  isWholeEggAllowed,
} from './carbon-cycle';

/**
 * Convert carb grams to oatmeal grams
 * @param carbGrams - Target carbs in grams
 * @returns Oatmeal weight in grams
 */
export function carbsToOatmealGrams(carbGrams: number): number {
  return Math.round(carbGrams / FOOD_CARB_CONTENT.OATMEAL);
}

/**
 * Convert carb grams to cooked white rice grams
 * @param carbGrams - Target carbs in grams
 * @returns Cooked rice weight in grams
 */
export function carbsToRiceGrams(carbGrams: number): number {
  return Math.round(carbGrams / FOOD_CARB_CONTENT.WHITE_RICE);
}

/**
 * Convert protein grams to food grams based on protein source
 * @param proteinGrams - Target protein in grams
 * @param source - CHICKEN, BEEF, or SHRIMP
 * @returns Food weight in grams
 */
export function proteinToFoodGrams(
  proteinGrams: number,
  source: TProteinSource
): number {
  return Math.round(proteinGrams / FOOD_PROTEIN_CONTENT[source]);
}

/**
 * Convert fat grams to olive oil milliliters
 * @param fatGrams - Target fat in grams
 * @returns Olive oil volume in milliliters
 */
export function fatToOilMl(fatGrams: number): number {
  return Math.round(fatGrams / OLIVE_OIL_FAT_CONTENT);
}

/**
 * Distribute total carbs across 3 meals
 * Breakfast gets oatmeal, lunch and dinner get rice
 * Distribution: 1/3 each
 *
 * @param totalCarbs - Total daily carbs in grams
 * @returns Carb distribution for each meal
 */
export function distributeCarbs(totalCarbs: number): {
  breakfast: number;
  lunch: number;
  dinner: number;
} {
  const perMeal = Math.round(totalCarbs / 3);
  return {
    breakfast: perMeal,
    lunch: perMeal,
    dinner: totalCarbs - 2 * perMeal, // Remainder to dinner
  };
}

/**
 * Distribute total protein across 4 meals
 * Distribution: 1/4 each
 *
 * @param totalProtein - Total daily protein in grams
 * @returns Protein distribution for each meal
 */
export function distributeProtein(totalProtein: number): {
  meal1: number;
  meal2: number;
  meal3: number;
  meal4: number;
} {
  const perMeal = Math.round(totalProtein / 4);
  return {
    meal1: perMeal,
    meal2: perMeal,
    meal3: perMeal,
    meal4: totalProtein - 3 * perMeal, // Remainder to last meal
  };
}

/**
 * Calculate total calories from macros
 * @param carbs - Carbs in grams
 * @param protein - Protein in grams
 * @param fat - Fat in grams
 * @returns Total calories
 */
export function calculateCalories(
  carbs: number,
  protein: number,
  fat: number
): number {
  return Math.round(
    carbs * CALORIES_PER_GRAM.CARBS +
      protein * CALORIES_PER_GRAM.PROTEIN +
      fat * CALORIES_PER_GRAM.FAT
  );
}

/**
 * Generate complete daily nutrition plan
 * Protein sources are randomly assigned per meal
 *
 * @param weight - Body weight in kg
 * @param bodyFatPercentage - Body fat as decimal
 * @param gender - MALE or FEMALE
 * @param carbDayType - LOW, MEDIUM, or HIGH
 * @returns Complete daily nutrition plan
 */
export function generateDailyNutritionPlan(
  weight: number,
  bodyFatPercentage: number,
  gender: TGender,
  carbDayType: TCarbDayType
): IDailyNutritionPlan {
  // Calculate macros
  const totalCarbs = calculateDailyCarbs(weight, carbDayType);
  const totalProtein = calculateDailyProtein(weight, bodyFatPercentage, gender);
  const totalFat = calculateDailyFat(
    weight,
    bodyFatPercentage,
    gender,
    carbDayType
  );
  const waterTarget = calculateWaterTarget(weight);
  const totalCalories = calculateCalories(totalCarbs, totalProtein, totalFat);

  // Distribute across meals
  const carbDistribution = distributeCarbs(totalCarbs);
  const proteinDistribution = distributeProtein(totalProtein);

  // Determine restrictions
  const allowOil = isOilAllowed(carbDayType);
  const allowWholeEgg = isWholeEggAllowed(carbDayType);

  // Randomly assign protein sources for each meal
  const proteinSource1 = getRandomProteinSource();
  const proteinSource2 = getRandomProteinSource();
  const proteinSource3 = getRandomProteinSource();
  const proteinSource4 = getRandomProteinSource();

  // Create meal portions
  const meals: IMealPortion[] = [
    {
      mealNumber: 1,
      mealName: 'breakfast',
      carbSource: 'oatmeal',
      carbGrams: carbDistribution.breakfast,
      carbFoodGrams: carbsToOatmealGrams(carbDistribution.breakfast),
      proteinSource: proteinSource1,
      proteinGrams: proteinDistribution.meal1,
      proteinFoodGrams: proteinToFoodGrams(
        proteinDistribution.meal1,
        proteinSource1
      ),
      allowOil,
      allowWholeEgg,
    },
    {
      mealNumber: 2,
      mealName: 'lunch',
      carbSource: 'rice',
      carbGrams: carbDistribution.lunch,
      carbFoodGrams: carbsToRiceGrams(carbDistribution.lunch),
      proteinSource: proteinSource2,
      proteinGrams: proteinDistribution.meal2,
      proteinFoodGrams: proteinToFoodGrams(
        proteinDistribution.meal2,
        proteinSource2
      ),
      allowOil,
      allowWholeEgg,
    },
    {
      mealNumber: 3,
      mealName: 'snack',
      carbSource: 'none',
      carbGrams: 0,
      carbFoodGrams: 0,
      proteinSource: proteinSource3,
      proteinGrams: proteinDistribution.meal3,
      proteinFoodGrams: proteinToFoodGrams(
        proteinDistribution.meal3,
        proteinSource3
      ),
      allowOil,
      allowWholeEgg,
    },
    {
      mealNumber: 4,
      mealName: 'dinner',
      carbSource: 'rice',
      carbGrams: carbDistribution.dinner,
      carbFoodGrams: carbsToRiceGrams(carbDistribution.dinner),
      proteinSource: proteinSource4,
      proteinGrams: proteinDistribution.meal4,
      proteinFoodGrams: proteinToFoodGrams(
        proteinDistribution.meal4,
        proteinSource4
      ),
      allowOil,
      allowWholeEgg,
    },
  ];

  // Food restrictions
  const restrictions: IFoodRestrictions = {
    noFruit: true, // Always restricted in first 1-1.5 months
    noWhiteSugar: true,
    noWhiteFlour: true,
    noEggYolk: carbDayType === 'HIGH',
    noOil: carbDayType === 'HIGH',
  };

  return {
    carbDayType,
    totalCarbs,
    totalProtein,
    totalFat,
    totalCalories,
    meals,
    waterTarget,
    oliveoilMl: fatToOilMl(totalFat),
    restrictions,
  };
}

/**
 * Generate daily meal plan data for database storage
 * Protein sources are randomly assigned per meal
 */
export function generateMealPlanData(
  weight: number,
  bodyFatPercentage: number,
  gender: TGender,
  carbDayType: TCarbDayType
): {
  oatmealGrams: number;
  riceGramsLunch: number;
  riceGramsDinner: number;
  proteinGramsMeal1: number;
  proteinSourceMeal1: TProteinSource;
  proteinGramsMeal2: number;
  proteinSourceMeal2: TProteinSource;
  proteinGramsMeal3: number;
  proteinSourceMeal3: TProteinSource;
  proteinGramsMeal4: number;
  proteinSourceMeal4: TProteinSource;
  oliveoilMl: number;
  allowWholeEgg: boolean;
  waterLiters: number;
} {
  const plan = generateDailyNutritionPlan(
    weight,
    bodyFatPercentage,
    gender,
    carbDayType
  );

  return {
    oatmealGrams: plan.meals[0].carbFoodGrams,
    riceGramsLunch: plan.meals[1].carbFoodGrams,
    riceGramsDinner: plan.meals[3].carbFoodGrams,
    proteinGramsMeal1: plan.meals[0].proteinFoodGrams,
    proteinSourceMeal1: plan.meals[0].proteinSource,
    proteinGramsMeal2: plan.meals[1].proteinFoodGrams,
    proteinSourceMeal2: plan.meals[1].proteinSource,
    proteinGramsMeal3: plan.meals[2].proteinFoodGrams,
    proteinSourceMeal3: plan.meals[2].proteinSource,
    proteinGramsMeal4: plan.meals[3].proteinFoodGrams,
    proteinSourceMeal4: plan.meals[3].proteinSource,
    oliveoilMl: plan.oliveoilMl,
    allowWholeEgg: !plan.restrictions.noEggYolk,
    waterLiters: plan.waterTarget,
  };
}

/**
 * Get meal name in Chinese
 */
export function getMealNameCN(
  mealName: 'breakfast' | 'lunch' | 'snack' | 'dinner'
): string {
  const names = {
    breakfast: '早餐',
    lunch: '午餐',
    snack: '加餐',
    dinner: '晚餐',
  };
  return names[mealName];
}

/**
 * Get protein source name in Chinese
 */
export function getProteinSourceNameCN(source: TProteinSource): string {
  const names: Record<TProteinSource, string> = {
    CHICKEN: '鸡肉(去皮)',
    BEEF: '牛肉',
    SHRIMP: '虾',
  };
  return names[source];
}
