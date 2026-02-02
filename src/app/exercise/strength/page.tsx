'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIntake } from '@/context/intake-context';
import { TCarbDayType } from '@/types/plan';
import { getReferencePortions } from '@/lib/nutrition-calculator';

export default function StrengthPage() {
  const router = useRouter();
  const { intake, saveToDatabase } = useIntake();
  const [isSaving, setIsSaving] = useState(false);
  const [carbDayType, setCarbDayType] = useState<TCarbDayType>('LOW');
  const [isLoading, setIsLoading] = useState(true);

  // Local form state
  const [minutes, setMinutes] = useState(0);

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
      if (intake.strengthCompleted) {
        setMinutes(intake.strengthMinutes);
      } else {
        setMinutes(refs.strengthMin);
      }
    }
  }, [isLoading, carbDayType, intake.strengthCompleted, intake.strengthMinutes]);

  const handleSubmit = async () => {
    setIsSaving(true);
    await saveToDatabase({
      strengthMinutes: minutes,
      strengthCompleted: true,
    });
    setIsSaving(false);
    router.push('/dashboard');
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
        <h1 className="flex-1 text-center font-semibold text-[#2C3E50]">力量训练录入</h1>
        <div className="w-12" />
      </header>

      <div className="pt-14 pb-24 px-4">
        {/* Training Time Section */}
        <Card className="mt-4 !p-4">
          <div className="text-center mb-6">
            <span className="text-4xl">🏋️</span>
            <h2 className="text-lg font-semibold text-[#2C3E50] mt-2">力量训练</h2>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-[#2C3E50]">训练时长</label>
            <p className="text-xs text-[#4A90D9] mt-1">
              建议 {refs.strengthMin}{refs.strengthMin !== refs.strengthMax ? `-${refs.strengthMax}` : ''} 分钟
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={minutes || ''}
              onChange={(e) => setMinutes(Number(e.target.value) || 0)}
              className="flex-1 px-4 py-4 border border-[#CCCCCC] rounded-lg text-center text-xl"
              placeholder="0"
              min={0}
            />
            <span className="text-base text-[#5D6D7E]">分钟</span>
          </div>
        </Card>

        {/* Tips Section */}
        <Card className="mt-4 !p-4 bg-[#FFF9E6]">
          <h3 className="text-sm font-medium text-[#2C3E50] mb-2">训练建议</h3>
          <ul className="text-xs text-[#5D6D7E] space-y-1">
            <li>• 缩短组间休息来增加强度</li>
            <li>• 专注复合动作（深蹲、硬拉、卧推等）</li>
            <li>• 确保动作规范，避免受伤</li>
          </ul>
        </Card>
      </div>

      {/* Bottom Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E5E8EB]">
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full py-4 text-base">
          {isSaving ? '保存中...' : '✓ 确认完成'}
        </Button>
      </div>
    </div>
  );
}
