'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function DinnerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetDate = searchParams.get('date'); // 获取URL参数中的日期
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
      if (intake.dinnerCompleted) {
        setRiceGrams(intake.dinnerRiceGrams);
        setMeatType(intake.dinnerMeatType);
        setMeatGrams(intake.dinnerMeatGrams);
        setOliveOilMl(intake.dinnerOliveOilMl);
      } else {
        setRiceGrams(refs.dinnerRice);
        setMeatType('chicken'); // default to chicken
        setMeatGrams(refs.dinnerMeat);
        // 晚餐建议分配剩余的橄榄油（午餐已摄入的部分减去）
        const lunchOil = intake.lunchOliveOilMl || 0;
        const remaining = Math.max(0, refs.oliveOilMl - lunchOil);
        setOliveOilMl(remaining);
      }
    }
  }, [isLoading, carbDayType, intake.dinnerCompleted, intake.dinnerRiceGrams, intake.dinnerMeatType, intake.dinnerMeatGrams, intake.dinnerOliveOilMl, intake.lunchOliveOilMl]);

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
    setMeatGrams(refs.dinnerMeat);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    if (targetDate) {
      // 保存历史日期数据
      try {
        const response = await fetch(`/api/intake-history/${targetDate}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dinnerRiceGrams: riceGrams,
            dinnerMeatType: customFood ? `custom:${customFood.name}` : meatType,
            dinnerMeatGrams: meatGrams,
            dinnerOliveOilMl: oliveOilMl,
            dinnerCompleted: true,
          }),
        });
        
        if (response.ok) {
          // 返回到历史记录页面，添加刷新参数
          router.push(`/history/${targetDate}?refresh=${Date.now()}`);
        } else {
          console.error('保存失败:', await response.text());
        }
      } catch (err) {
        console.error('保存失败:', err);
      }
    } else {
      // 保存今日数据
      await saveToDatabase({
        dinnerRiceGrams: riceGrams,
        dinnerMeatType: customFood ? `custom:${customFood.name}` : meatType,
        dinnerMeatGrams: meatGrams,
        dinnerOliveOilMl: oliveOilMl,
        dinnerCompleted: true,
      });
      router.push('/dashboard');
    }
    setIsSaving(false);
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
        <h1 className="flex-1 text-center font-semibold text-[#2C3E50]">晚餐录入</h1>
        <div className="w-12" />
      </header>

      <div className="pt-14 pb-24 px-4">
        {/* Rice Section */}
        <Card className="mt-4 !p-4">
          <div className="mb-4">
            <label className="text-sm font-medium text-[#2C3E50]">米饭（熟重）</label>
            <p className="text-xs text-[#4A90D9] mt-1">参考 {refs.dinnerRice}g</p>
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
            <p className="text-xs text-[#4A90D9] mt-1">参考 约{refs.dinnerMeat}g（提供约22g蛋白质）</p>
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
                搜索其他食材
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
              {(() => {
                const lunchOil = intake.lunchOliveOilMl || 0;
                const remaining = Math.max(0, refs.oliveOilMl - lunchOil);
                return (
                  <p className="text-xs text-[#5D6D7E] mt-1">
                    今日总需 {refs.oliveOilMl}ml，午餐已摄入 {lunchOil}ml，
                    <span className={remaining > 0 ? 'text-[#F59E0B] font-medium' : 'text-[#27AE60]'}>
                      {remaining > 0 ? `还需 ${remaining}ml` : '已达标'}
                    </span>
                  </p>
                );
              })()}
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
            {(() => {
              const lunchOil = intake.lunchOliveOilMl || 0;
              const remaining = Math.max(0, refs.oliveOilMl - lunchOil);
              const options = [10, 15, 20, 25];
              return (
                <div className="flex gap-2">
                  {options.map((ml) => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => setOliveOilMl(ml)}
                      className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                        oliveOilMl === ml
                          ? 'bg-[#F59E0B] text-white'
                          : ml === remaining
                          ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {ml}ml{ml === remaining && ' ⭐'}
                    </button>
                  ))}
                </div>
              );
            })()}
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

export default function DinnerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    }>
      <DinnerContent />
    </Suspense>
  );
}
