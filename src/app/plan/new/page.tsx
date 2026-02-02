'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PlanCalendar } from '@/components/plan/plan-calendar';
import { TCarbDayType } from '@/types/plan';

interface DayPlan {
  id: string;
  date: string;
  dayNumber: number;
  carbDayType: TCarbDayType;
}

interface CreatedPlan {
  id: string;
  startDate: string;
  dailyMealPlans: DayPlan[];
}

const CYCLE_LENGTH = 6; // 112113 pattern is 6 days

export default function NewPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPlan, setCreatedPlan] = useState<CreatedPlan | null>(null);

  // Form data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Set default dates on client side
  useEffect(() => {
    const today = new Date();
    const defaultEnd = new Date(today);
    defaultEnd.setDate(today.getDate() + 13); // Default to 14 days (2+ full cycles)

    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(defaultEnd.toISOString().split('T')[0]);
  }, []);

  // Calculate cycle info
  const cycleInfo = useMemo(() => {
    if (!startDate || !endDate) {
      return { totalDays: 0, fullCycles: 0, cycleDays: 0, isValid: false };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end

    if (totalDays < 1) {
      return { totalDays: 0, fullCycles: 0, cycleDays: 0, isValid: false };
    }

    const fullCycles = Math.floor(totalDays / CYCLE_LENGTH);
    const cycleDays = fullCycles * CYCLE_LENGTH;

    return {
      totalDays,
      fullCycles,
      cycleDays,
      isValid: fullCycles >= 1,
    };
  }, [startDate, endDate]);

  const handleCreatePlan = async () => {
    if (!startDate || !cycleInfo.isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          cycleDays: cycleInfo.cycleDays,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '创建计划失败');
      }

      const plan = await res.json();
      setCreatedPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建计划失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  // Show calendar after plan is created
  if (createdPlan) {
    return (
      <PageContainer>
        <div className="min-h-screen py-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-[#2C3E50]">计划创建成功！</h1>
            <p className="text-[#5D6D7E] mt-2">
              你的碳循环计划已生成，共 {createdPlan.dailyMealPlans.length} 天
            </p>
          </div>

          <PlanCalendar
            startDate={createdPlan.startDate}
            dailyPlans={createdPlan.dailyMealPlans}
            className="mb-6"
          />

          <div className="space-y-3">
            <Button onClick={handleGoToDashboard} className="w-full">
              开始执行计划
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCreatedPlan(null)}
              className="w-full"
            >
              重新创建
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="min-h-screen flex flex-col justify-center py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#2C3E50]">开启计划</h1>
          <p className="text-[#5D6D7E] mt-2">设置你的碳循环计划</p>
        </div>

        {error && (
          <Card variant="warning" className="mb-4">
            <p className="text-[#E74C3C]">{error}</p>
          </Card>
        )}

        <Card className="mb-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🚀</div>
            <h2 className="text-lg font-semibold text-[#2C3E50]">112113 碳循环模式</h2>
            <p className="text-sm text-[#5D6D7E] mt-2">
              每6天一个循环：低→低→中→低→低→高
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {['低', '低', '中', '低', '低', '高'].map((type, index) => (
              <div
                key={index}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
                style={{
                  backgroundColor:
                    type === '低' ? '#A8D5BA' : type === '中' ? '#F5C542' : '#E74C3C',
                }}
              >
                {type}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Input
              label="开始日期"
              type="date"
              value={startDate}
              onChange={(v) => setStartDate(String(v))}
            />

            <Input
              label="结束日期"
              type="date"
              value={endDate}
              onChange={(v) => setEndDate(String(v))}
              min={startDate}
              error={
                endDate && startDate && endDate < startDate
                  ? '结束日期必须晚于开始日期'
                  : undefined
              }
            />

            {/* Cycle calculation result */}
            {startDate && endDate && endDate >= startDate && (
              <div
                className={`p-4 rounded-lg ${
                  cycleInfo.isValid ? 'bg-[#EEF2F7]' : 'bg-red-50'
                }`}
              >
                {cycleInfo.isValid ? (
                  <div className="text-center">
                    <p className="text-[#2C3E50] font-medium">
                      共 <span className="text-[#4A90D9] font-bold">{cycleInfo.totalDays}</span> 天，
                      包含 <span className="text-[#4A90D9] font-bold">{cycleInfo.fullCycles}</span> 个完整循环
                      （<span className="text-[#4A90D9] font-bold">{cycleInfo.cycleDays}</span> 天）
                    </p>
                    {cycleInfo.totalDays > cycleInfo.cycleDays && (
                      <p className="text-sm text-[#5D6D7E] mt-1">
                        尾数 {cycleInfo.totalDays - cycleInfo.cycleDays} 天将不包含在计划中
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[#E74C3C] text-center font-medium">
                    至少需要6天才能包含1个完整循环
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <Button
          onClick={handleCreatePlan}
          loading={isLoading}
          disabled={!cycleInfo.isValid}
          className="w-full"
        >
          开启计划
        </Button>
      </div>
    </PageContainer>
  );
}
