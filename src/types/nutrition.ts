/**
 * Nutrition and macro type definitions
 */

import { TCarbDayType, TProteinSource } from './plan';

export interface IMacros {
  carbs: number; // grams
  protein: number; // grams
  fat: number; // grams
  calories: number;
}

export interface IMealPortion {
  mealNumber: 1 | 2 | 3 | 4;
  mealName: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  carbSource: 'oatmeal' | 'rice' | 'none';
  carbGrams: number; // grams of carb nutrient
  carbFoodGrams: number; // grams of actual food (oatmeal or rice)
  proteinSource: TProteinSource;
  proteinGrams: number; // grams of protein nutrient
  proteinFoodGrams: number; // grams of actual food (chicken/beef/shrimp)
  allowOil: boolean;
  allowWholeEgg: boolean;
}

export interface IDailyNutritionPlan {
  carbDayType: TCarbDayType;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalCalories: number;

  meals: IMealPortion[];
  waterTarget: number;
  oliveoilMl: number;

  restrictions: IFoodRestrictions;
}

export interface IFoodRestrictions {
  noFruit: boolean;
  noWhiteSugar: boolean;
  noWhiteFlour: boolean;
  noEggYolk: boolean; // true on high carb days
  noOil: boolean; // true on high carb days
}

/**
 * Food nutritional content constants
 * Values are grams of macro per 100g of food
 */
export const FOOD_CARB_CONTENT = {
  OATMEAL: 0.66, // 66g carbs per 100g dry oatmeal
  WHITE_RICE: 0.28, // 28g carbs per 100g cooked white rice
} as const;

export const FOOD_PROTEIN_CONTENT = {
  CHICKEN: 0.31, // 31g protein per 100g skinless chicken breast
  BEEF: 0.26, // 26g protein per 100g lean beef
  SHRIMP: 0.24, // 24g protein per 100g shrimp
} as const;

export const OLIVE_OIL_FAT_CONTENT = 1.0; // 1g fat per 1ml olive oil (approximately)

/**
 * Calorie constants
 */
export const CALORIES_PER_GRAM = {
  CARBS: 4,
  PROTEIN: 4,
  FAT: 9,
} as const;

/**
 * Food display names (Chinese)
 */
export const FOOD_NAMES_CN = {
  OATMEAL: '燕麦',
  WHITE_RICE: '白米饭',
  CHICKEN: '鸡肉(去皮)',
  BEEF: '牛肉',
  SHRIMP: '虾',
  OLIVE_OIL: '橄榄油',
  WATER: '水',
  WHOLE_EGG: '全蛋',
  EGG_WHITE: '蛋白',
} as const;

/**
 * Restricted food names (Chinese)
 */
export const RESTRICTED_FOODS_CN = {
  FRUIT: '水果',
  WHITE_SUGAR: '白糖',
  WHITE_FLOUR: '白面',
  EGG_YOLK: '蛋黄',
  OIL: '油脂',
} as const;
