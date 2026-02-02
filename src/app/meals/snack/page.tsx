'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIntake } from '@/context/intake-context';
import { TCarbDayType } from '@/types/plan';
import { SNACK_PROTEIN_OPTIONS, PROTEIN_DEFAULT_GRAMS, FOOD_NAMES } from '@/constants/nutrition';
import { getReferencePortions } from '@/lib/nutrition-calculator';

export default function SnackPage() {
  const router = useRouter();
  const { intake, updateMultiple } = useIntake();
  const [carbDayType, setCarbDayType] = useState<TCarbDayType>('LOW');
  const [isLoading, setIsLoading] = useState(true);

  // Local form state
  const [riceGrams, setRiceGrams] = useState(0);
  const [proteinType, setProteinType] = useState('');
  const [proteinGrams, setProteinGrams] = useState(0);

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
      if (intake.snackCompleted) {
        setRiceGrams(intake.snackRiceGrams);
        setProteinType(intake.snackMeatType);
        setProteinGrams(intake.snackMeatGrams);
      } else {
        setRiceGrams(refs.snackRice);
        setProteinType('proteinPowder'); // default to protein powder
        setProteinGrams(PROTEIN_DEFAULT_GRAMS.proteinPowder);
      }
    }
  }, [isLoading, carbDayType, intake.snackCompleted, intake.snackRiceGrams, intake.snackMeatType, intake.snackMeatGrams]);

  // Update grams when protein type changes
  const handleProteinTypeChange = (newType: string) => {
    setProteinType(newType);
    if (newType && PROTEIN_DEFAULT_GRAMS[newType]) {
      setProteinGrams(PROTEIN_DEFAULT_GRAMS[newType]);
    }
  };

  const handleSubmit = () => {
    updateMultiple({
      snackRiceGrams: riceGrams,
      snackMeatType: proteinType,
      snackMeatGrams: proteinGrams,
      snackCompleted: true,
    });
    router.push('/dashboard');
  };

  const refs = getReferencePortions(carbDayType);

  // Get reference text for current protein type
  const getProteinRefText = () => {
    if (!proteinType) return '约100g（提供约22g蛋白质）';
    const defaultGrams = PROTEIN_DEFAULT_GRAMS[proteinType] || 100;
    return `${defaultGrams}g（约22g蛋白质）`;
  };

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
        <h1 className="flex-1 text-center font-semibold text-[#2C3E50]">加餐录入</h1>
        <div className="w-12" />
      </header>

      <div className="pt-14 pb-24 px-4">
        {/* Rice Section - only show if not HIGH carb day */}
        {refs.snackRice > 0 && (
          <Card className="mt-4 !p-4">
            <div className="mb-4">
              <label className="text-sm font-medium text-[#2C3E50]">米饭（熟重）</label>
              <p className="text-xs text-[#4A90D9] mt-1">参考 {refs.snackRice}g</p>
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
        )}

        {/* HIGH carb day notice */}
        {refs.snackRice === 0 && (
          <Card className="mt-4 !p-4 bg-[#FFF3E0]">
            <p className="text-sm text-[#E65100]">
              高碳日加餐不需要米饭，仅摄入蛋白质即可。
            </p>
          </Card>
        )}

        {/* Protein Section */}
        <Card className="mt-4 !p-4">
          <div className="mb-4">
            <label className="text-sm font-medium text-[#2C3E50]">蛋白来源</label>
            <p className="text-xs text-[#4A90D9] mt-1">参考 {getProteinRefText()}</p>
          </div>

          {/* Protein Type Selection */}
          <div className="mb-4">
            <select
              value={proteinType}
              onChange={(e) => handleProteinTypeChange(e.target.value)}
              className="w-full px-4 py-3 border border-[#CCCCCC] rounded-lg text-base bg-white"
            >
              {SNACK_PROTEIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Protein Grams */}
          {proteinType && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={proteinGrams || ''}
                onChange={(e) => setProteinGrams(Number(e.target.value) || 0)}
                className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-lg text-center text-lg"
                placeholder="0"
                min={0}
              />
              <span className="text-sm text-[#5D6D7E]">克</span>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="mt-4 !p-4 bg-[#E8F4FD]">
          <h3 className="text-sm font-medium text-[#2C3E50] mb-2">加餐说明</h3>
          <ul className="text-xs text-[#5D6D7E] space-y-1">
            <li>• 加餐是第3次蛋白质摄入</li>
            <li>• 每次蛋白质约22g</li>
            <li>• 蛋白粉28g ≈ 肉类100g</li>
            <li>• 餐间间隔3-4.5小时</li>
          </ul>
        </Card>
      </div>

      {/* Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E5E8EB]">
        <Button onClick={handleSubmit} className="w-full py-4 text-base">
          ✓ 确认完成
        </Button>
      </div>
    </div>
  );
}
