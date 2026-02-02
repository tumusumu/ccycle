'use client';

import { Card } from '@/components/ui/card';
import { FoodItem } from './food-item';
import { getMealNameCN, getProteinSourceNameCN } from '@/utils/nutrition';
import { TProteinSource } from '@/types/plan';

export interface IMealCardProps {
  mealName: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  mealNumber: 1 | 2 | 3 | 4;
  carbSource?: 'oatmeal' | 'rice' | 'none';
  carbFoodGrams: number;
  proteinSource: TProteinSource;
  proteinFoodGrams: number;
  allowOil: boolean;
  allowWholeEgg: boolean;
  checkedItems?: {
    carb: boolean;
    protein: boolean;
  };
  onCheckCarb?: () => void;
  onCheckProtein?: () => void;
  className?: string;
}

const carbSourceNames = {
  oatmeal: '燕麦',
  rice: '米饭',
  none: '',
};

const mealEmojis = {
  breakfast: '🌅',
  lunch: '☀️',
  snack: '🍵',
  dinner: '🌙',
};

export function MealCard({
  mealName,
  carbSource = 'none',
  carbFoodGrams,
  proteinSource,
  proteinFoodGrams,
  allowOil,
  allowWholeEgg,
  checkedItems = { carb: false, protein: false },
  onCheckCarb,
  onCheckProtein,
  className = '',
}: IMealCardProps) {
  const mealNameCN = getMealNameCN(mealName);
  const proteinNameCN = getProteinSourceNameCN(proteinSource);

  return (
    <Card className={className}>
      {/* Meal Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{mealEmojis[mealName]}</span>
        <h3 className="text-base font-semibold text-[#2C3E50]">{mealNameCN}</h3>
      </div>

      <div className="space-y-1 -mx-4">
        {/* Carb item */}
        {carbSource !== 'none' && carbFoodGrams > 0 && (
          <FoodItem
            name={carbSourceNames[carbSource]}
            amount={Math.round(carbFoodGrams)}
            unit="g"
            checked={checkedItems.carb}
            onCheck={onCheckCarb ?? (() => {})}
          />
        )}

        {/* Protein item */}
        <FoodItem
          name={proteinNameCN}
          amount={Math.round(proteinFoodGrams)}
          unit="g"
          checked={checkedItems.protein}
          onCheck={onCheckProtein ?? (() => {})}
        />

        {/* Vegetables note */}
        <div className="py-2 px-4 text-sm text-[#5D6D7E]">
          + 蔬菜（随意）
        </div>
      </div>

      {/* Notes about oil and eggs */}
      <div className="mt-3 pt-3 border-t border-[#EEF2F7] text-xs space-y-1">
        {allowOil ? (
          <p className="text-[#5D6D7E]">✓ 可用少量橄榄油烹饪</p>
        ) : (
          <p className="text-[#E74C3C] font-medium">✗ 禁止用油</p>
        )}
        {allowWholeEgg ? (
          <p className="text-[#5D6D7E]">✓ 可吃全蛋</p>
        ) : (
          <p className="text-[#E74C3C] font-medium">✗ 只能吃蛋白,不能吃蛋黄</p>
        )}
      </div>
    </Card>
  );
}
