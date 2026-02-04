'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIntake } from '@/context/intake-context';
import { TCarbDayType } from '@/types/plan';
import { getReferencePortions } from '@/lib/nutrition-calculator';

function BreakfastContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetDate = searchParams.get('date'); // 获取URL参数中的日期
  const { intake, saveToDatabase } = useIntake();
  const [isSaving, setIsSaving] = useState(false);
  const [carbDayType, setCarbDayType] = useState<TCarbDayType>('LOW');
  const [isLoading, setIsLoading] = useState(true);

  // Local form state
  const [oatmealGrams, setOatmealGrams] = useState(0);
  const [wholeEggs, setWholeEggs] = useState(0);
  const [whiteOnlyEggs, setWhiteOnlyEggs] = useState(0);

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
      if (intake.breakfastCompleted) {
        setOatmealGrams(intake.oatmealGrams);
        setWholeEggs(intake.wholeEggs);
        setWhiteOnlyEggs(intake.whiteOnlyEggs);
      } else {
        setOatmealGrams(refs.oatmeal);
        setWholeEggs(refs.wholeEggs);
        setWhiteOnlyEggs(refs.whiteOnlyEggs);
      }
    }
  }, [isLoading, carbDayType, intake.breakfastCompleted, intake.oatmealGrams, intake.wholeEggs, intake.whiteOnlyEggs]);

  const handleSubmit = async () => {
    setIsSaving(true);
    
    if (targetDate) {
      // 保存历史日期数据
      try {
        await fetch(`/api/intake-history/${targetDate}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            oatmealGrams,
            wholeEggs,
            whiteOnlyEggs,
            breakfastCompleted: true,
          }),
        });
        // 返回到历史记录页面
        router.push(`/history/${targetDate}`);
      } catch (err) {
        console.error('保存失败:', err);
      }
    } else {
      // 保存今天的数据（原逻辑）
      await saveToDatabase({
        oatmealGrams,
        wholeEggs,
        whiteOnlyEggs,
        breakfastCompleted: true,
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

  // 格式化历史日期显示
  const historicalDateText = targetDate ? new Date(targetDate + 'T00:00:00').toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }) : null;

  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E8EB] flex items-center px-4 z-50">
        <button onClick={() => router.back()} className="text-[#4A90D9] text-sm flex items-center gap-1">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 className="flex-1 text-center font-semibold text-[#2C3E50]">早餐录入</h1>
        <div className="w-12" />
      </header>

      <div className="pt-14 pb-24 px-4">
        {/* 历史记录补充提示 */}
        {targetDate && (
          <Card className="mt-4 !p-3 bg-[#FFF9E6] border-[#F5C542]">
            <div className="flex items-start gap-2">
              <span className="text-lg">📅</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#2C3E50] mb-1">
                  补充历史记录
                </h3>
                <p className="text-xs text-[#5D6D7E]">
                  正在为 <span className="font-medium">{historicalDateText}</span> 补充早餐记录
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Oatmeal Section */}
        <Card className="mt-4 !p-4">
          <div className="mb-4">
            <label className="text-sm font-medium text-[#2C3E50]">燕麦（生重）</label>
            <p className="text-xs text-[#4A90D9] mt-1">参考 {refs.oatmeal}g</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={oatmealGrams || ''}
              onChange={(e) => setOatmealGrams(Number(e.target.value) || 0)}
              className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-lg text-center text-lg"
              placeholder="0"
              min={0}
            />
            <span className="text-sm text-[#5D6D7E]">克</span>
          </div>
        </Card>

        {/* Eggs Section */}
        <Card className="mt-4 !p-4">
          <div className="mb-4">
            <label className="text-sm font-medium text-[#2C3E50]">鸡蛋</label>
          </div>

          {/* Whole Eggs */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#5D6D7E]">含蛋黄</span>
              <span className="text-xs text-[#4A90D9]">参考 {refs.wholeEggs}个</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={wholeEggs || ''}
                onChange={(e) => setWholeEggs(Number(e.target.value) || 0)}
                className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-lg text-center text-lg"
                placeholder="0"
                min={0}
              />
              <span className="text-sm text-[#5D6D7E]">个</span>
            </div>
          </div>

          {/* White Only Eggs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#5D6D7E]">去黄</span>
              <span className="text-xs text-[#4A90D9]">参考 {refs.whiteOnlyEggs}个</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={whiteOnlyEggs || ''}
                onChange={(e) => setWhiteOnlyEggs(Number(e.target.value) || 0)}
                className="flex-1 px-4 py-3 border border-[#CCCCCC] rounded-lg text-center text-lg"
                placeholder="0"
                min={0}
              />
              <span className="text-sm text-[#5D6D7E]">个</span>
            </div>
          </div>
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

export default function BreakfastPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
      <BreakfastContent />
    </Suspense>
  );
}
