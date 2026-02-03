'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIntake } from '@/context/intake-context';
import { TCarbDayType } from '@/types/plan';
import { MEAT_OPTIONS } from '@/constants/nutrition';
import { getReferencePortions } from '@/lib/nutrition-calculator';
import { NutritionSearch, INutritionResult } from '@/components/nutrition-search';

// Custom food info from nutrition search
interface ICustomFood {
  name: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
}

export default function LunchPage() {
  const router = useRouter();
  const { intake, saveToDatabase } = useIntake();
  const [isSaving, setIsSaving] = useState(false);
  const [carbDayType, setCarbDayType] = useState<TCarbDayType>('LOW');
  const [isLoading, setIsLoading] = useState(true);

  // Local form state
  const [riceGrams, setRiceGrams] = useState(0);
  const [meatType, setMeatType] = useState('');
  const [meatGrams, setMeatGrams] = useState(0);
  const [oliveOilMl, setOliveOilMl] = useState(0);

  // Nutrition search state
  const [showSearch, setShowSearch] = useState(false);
  const [customFood, setCustomFood] = useState<ICustomFood | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/daily-plan/today');
      const data = await res.json();
      if (data.carbDayType) {
        setCarbDayType(data.carbDayType);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Initialize form with existing intake or reference values
  useEffect(() => {
    if (!isLoading) {
      const refs = getReferencePortions(carbDayType);
      if (intake.lunchCompleted) {
        setRiceGrams(intake.lunchRiceGrams);
        setMeatType(intake.lunchMeatType);
        setMeatGrams(intake.lunchMeatGrams);
        setOliveOilMl(intake.lunchOliveOilMl);
      } else {
        setRiceGrams(refs.lunchRice);
        setMeatType('chicken'); // default to chicken
        setMeatGrams(refs.lunchMeat);
        // 默认建议午餐分配一半的橄榄油
        setOliveOilMl(Math.round(refs.oliveOilMl / 2));
      }
    }
  }, [isLoading, carbDayType, intake.lunchCompleted, intake.lunchRiceGrams, intake.lunchMeatType, intake.lunchMeatGrams, intake.lunchOliveOilMl]);

  const handleSubmit = async () => {
    setIsSaving(true);
    await saveToDatabase({
      lunchRiceGrams: riceGrams,
      lunchMeatType: customFood ? `custom:${customFood.name}` : meatType,
      lunchMeatGrams: meatGrams,
      lunchOliveOilMl: oliveOilMl,
      lunchCompleted: true,
    });
    setIsSaving(false);
    router.push('/dashboard');
  };

  // Handle nutrition search selection
  const handleNutritionSelect = (result: INutritionResult) => {
    // Calculate grams needed for ~22g protein
    const gramsFor22gProtein = result.protein > 0
      ? Math.round((22 / result.protein) * 100)
      : 100;

    setCustomFood({
      name: result.foodName,
      protein: result.protein,
      fat: result.fat,
      carbs: result.carbs,
      calories: result.calories,
    });
    setMeatType('custom');
    setMeatGrams(gramsFor22gProtein);
  };

  // Clear custom food and return to dropdown selection
  const handleClearCustomFood = () => {
    setCustomFood(null);
    setMeatType('chicken');
    setMeatGrams(refs.lunchMeat);
  };

  const refs = getReferencePortions(carbDayType);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E8EB] flex items-center px-4 z-50">
        <button onClick={() => router.back()} className="text-[#4A90D9] text-sm flex items-center gap-1">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 className="flex-1 text-center font-semibold text-[#2C3E50]">午餐录入</h1>
        <div className="w-12" />
      </header>

      <div className="pt-14 pb-24 px-4">
        {/* Rice Section */}
        <Card className="mt-4 !p-4">
          <div className="mb-4">
            <label className="text-sm font-medium text-[#2C3E50]">米饭（熟重）</label>
            <p className="text-xs text-[#4A90D9] mt-1">参考 {refs.lunchRice}g</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={riceGrams || ''}
              onChange={(e) => setRiceGrams(Number(e.target.value) || 0)}
              className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-lg text-center text-lg"
              placeholder="0"
              min={0}
            />
            <span className="text-sm text-[#5D6D7E]">克</span>
          </div>
        </Card>

        {/* Meat Section */}
        <Card className="mt-4 !p-4">
          <div className="mb-4">
            <label className="text-sm font-medium text-[#2C3E50]">肉菜（生重）</label>
            <p className="text-xs text-[#4A90D9] mt-1">参考 约{refs.lunchMeat}g（提供约22g蛋白质）</p>
          </div>

          {/* Custom Food Display */}
          {customFood ? (
            <div className="mb-4">
              <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#2C3E50] line-clamp-2">{customFood.name}</p>
                    <div className="flex gap-3 mt-2 text-xs text-[#5D6D7E]">
                      <span>蛋白质 {customFood.protein}g</span>
                      <span>脂肪 {customFood.fat}g</span>
                      <span>碳水 {customFood.carbs}g</span>
                    </div>
                    <p className="text-xs text-[#AEB6BF] mt-1">每100g</p>
                  </div>
                  <button
                    onClick={handleClearCustomFood}
                    className="text-[#DC2626] text-xs ml-2"
                  >
                    清除
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Meat Type Selection */}
              <div className="mb-4">
                <select
                  value={meatType}
                  onChange={(e) => setMeatType(e.target.value)}
                  className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg text-base bg-white"
                >
                  {MEAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Search Other Foods Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="w-full py-2 text-sm text-[#4A90D9] hover:text-[#3A7BC8] mb-4"
              >
                🔍 搜索其他食材
              </button>
            </>
          )}

          {/* Meat Grams */}
          {(meatType || customFood) && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={meatGrams || ''}
                onChange={(e) => setMeatGrams(Number(e.target.value) || 0)}
                className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-lg text-center text-lg"
                placeholder="0"
                min={0}
              />
              <span className="text-sm text-[#5D6D7E]">克</span>
            </div>
          )}
        </Card>

        {/* Olive Oil Section - 仅在低碳日和中碳日显示 */}
        {refs.oliveOilMl > 0 && (
          <Card className="mt-4 !p-4 bg-[#FFFBEB] border-[#F59E0B]/30">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🫒</span>
                <label className="text-sm font-medium text-[#2C3E50]">脂肪来源</label>
                <span className="text-xs text-[#F59E0B] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                  {carbDayType === 'LOW' ? '低碳日需补充' : '中碳日适量添加'}
                </span>
              </div>
              <p className="text-xs text-[#5D6D7E] mt-1">
                今日总需 {refs.oliveOilMl}ml，建议午餐 {Math.round(refs.oliveOilMl / 2)}ml
              </p>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-[#5D6D7E] w-16">橄榄油</span>
              <input
                type="number"
                value={oliveOilMl || ''}
                onChange={(e) => setOliveOilMl(Number(e.target.value) || 0)}
                className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-lg text-center text-lg"
                placeholder="0"
                min={0}
                max={50}
              />
              <span className="text-sm text-[#5D6D7E]">ml</span>
            </div>

            {/* 快捷按钮 */}
            <div className="flex gap-2">
              {[10, 15, 20, 25].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => setOliveOilMl(ml)}
                  className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                    oliveOilMl === ml
                      ? 'bg-[#F59E0B] text-white'
                      : ml === Math.round(refs.oliveOilMl / 2)
                      ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {ml}ml{ml === Math.round(refs.oliveOilMl / 2) && ' ⭐'}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Nutrition Search Modal */}
      {showSearch && (
        <NutritionSearch
          onSelect={handleNutritionSelect}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E5E8EB]">
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full py-4 text-base">
          {isSaving ? '保存中...' : '✓ 确认完成'}
        </Button>
      </div>
    </div>
  );
}
