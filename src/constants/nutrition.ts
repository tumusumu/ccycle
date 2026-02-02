/**
 * Nutrition data per 100g (raw weight unless noted)
 */

export interface INutritionData {
  protein: number; // g per 100g
  fat: number; // g per 100g
  carbs: number; // g per 100g
}

export interface IEggNutrition {
  protein: number; // g per egg
  fat: number; // g per egg
  carbs: number; // g per egg
}

// Per 100g raw weight
export const NUTRITION_PER_100G: Record<string, INutritionData> = {
  oatmeal: { protein: 15, fat: 6.9, carbs: 66 },
  beef: { protein: 21, fat: 2.5, carbs: 0 },
  chicken: { protein: 23, fat: 1.2, carbs: 0 },
  shrimp: { protein: 18.6, fat: 0.8, carbs: 0 },
  fish: { protein: 18, fat: 3, carbs: 0 },
  rice: { protein: 2.6, fat: 0.3, carbs: 28 }, // cooked weight
  proteinPowder: { protein: 78, fat: 4, carbs: 7 }, // whey protein powder
};

// Per egg
export const EGG_NUTRITION: Record<string, IEggNutrition> = {
  whole: { protein: 6, fat: 5, carbs: 0 }, // with yolk
  white: { protein: 3.6, fat: 0, carbs: 0 }, // white only
};

// Food display names
export const FOOD_NAMES: Record<string, string> = {
  oatmeal: '燕麦',
  beef: '牛肉',
  chicken: '去皮鸡肉',
  shrimp: '虾肉',
  fish: '鱼肉',
  rice: '米饭',
  proteinPowder: '蛋白粉',
};

// Meat options for dropdown
export const MEAT_OPTIONS = [
  { value: '', label: '选择肉类' },
  { value: 'beef', label: '牛肉' },
  { value: 'chicken', label: '去皮鸡肉' },
  { value: 'shrimp', label: '虾肉' },
  { value: 'fish', label: '鱼肉' },
];

// Snack protein options (includes protein powder)
export const SNACK_PROTEIN_OPTIONS = [
  { value: '', label: '选择蛋白来源' },
  { value: 'proteinPowder', label: '蛋白粉' },
  { value: 'beef', label: '牛肉' },
  { value: 'chicken', label: '去皮鸡肉' },
  { value: 'shrimp', label: '虾肉' },
  { value: 'fish', label: '鱼肉' },
];

// Default grams for protein sources (to provide ~22g protein)
export const PROTEIN_DEFAULT_GRAMS: Record<string, number> = {
  proteinPowder: 28, // 28g × 78% = ~22g protein
  beef: 105,         // 105g × 21% = ~22g protein
  chicken: 96,       // 96g × 23% = ~22g protein
  shrimp: 118,       // 118g × 18.6% = ~22g protein
  fish: 122,         // 122g × 18% = ~22g protein
};

// Calculate nutrition from grams
export function calculateNutrition(foodKey: string, grams: number): INutritionData {
  const data = NUTRITION_PER_100G[foodKey];
  if (!data) return { protein: 0, fat: 0, carbs: 0 };

  const ratio = grams / 100;
  return {
    protein: Math.round(data.protein * ratio * 10) / 10,
    fat: Math.round(data.fat * ratio * 10) / 10,
    carbs: Math.round(data.carbs * ratio * 10) / 10,
  };
}

// Calculate egg nutrition
export function calculateEggNutrition(wholeEggs: number, whiteOnlyEggs: number): INutritionData {
  const whole = EGG_NUTRITION.whole;
  const white = EGG_NUTRITION.white;

  return {
    protein: Math.round((whole.protein * wholeEggs + white.protein * whiteOnlyEggs) * 10) / 10,
    fat: Math.round((whole.fat * wholeEggs + white.fat * whiteOnlyEggs) * 10) / 10,
    carbs: 0,
  };
}
