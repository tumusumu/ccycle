'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { getPatternName, getCarbDayTypeName } from '@/utils/carbon-cycle';
import { formatDateCN } from '@/utils/date';
import { TCarbDayType } from '@/types/plan';

interface PlanData {
  id: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  currentDay: number;
  totalDaysElapsed: number;
  totalDays: number;
  completionPercentage: number;
  dailyMealPlans: Array<{
    date: string;
    dayNumber: number;
    carbDayType: TCarbDayType;
  }>;
}

const carbDayBadgeVariant: Record<TCarbDayType, 'low' | 'medium' | 'high'> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    try {
      const res = await fetch('/api/plan/current');
      if (res.status === 404) {
        router.push('/onboarding');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleRestart = async () => {
    if (!confirm('确定要重新开始计划吗?当前计划将被取消。')) {
      return;
    }

    try {
      // Cancel current plan
      if (plan) {
        await fetch(`/api/plan/${plan.id}`, {
          method: 'DELETE',
        });
      }
      // Redirect to onboarding
      router.push('/onboarding');
    } catch (err) {
      console.error('Failed to restart:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const startDate = new Date(plan.startDate);
  const upcomingDays = plan.dailyMealPlans.slice(
    Math.max(0, plan.totalDaysElapsed - 1),
    plan.totalDaysElapsed + 5
  );

  return (
    <>
      <Header />

      <PageContainer className="pt-16">
        <h1 className="text-2xl font-bold text-[#2C3E50] mb-4">我的计划</h1>

        {/* Plan Status */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#2C3E50]">当前计划</h3>
            <Badge variant="info">{plan.status === 'ACTIVE' ? '进行中' : plan.status}</Badge>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-[#EEF2F7]">
              <span className="text-[#5D6D7E]">循环模式</span>
              <span className="font-medium text-[#2C3E50]">
                {getPatternName()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#EEF2F7]">
              <span className="text-[#5D6D7E]">开始日期</span>
              <span className="font-medium text-[#2C3E50]">{formatDateCN(startDate, 'long')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#5D6D7E]">当前进度</span>
              <span className="font-medium text-[#2C3E50]">
                第 {plan.totalDaysElapsed} / {plan.totalDays} 天
              </span>
            </div>
          </div>

          <ProgressBar
            value={plan.completionPercentage}
            label="完成度"
            showPercentage
            color="green"
            className="mt-4"
          />
        </Card>

        {/* Upcoming Days */}
        <Card className="mb-4">
          <h3 className="font-semibold text-[#2C3E50] mb-4">近期安排</h3>
          <div className="space-y-2">
            {upcomingDays.map((day) => {
              const isToday = day.dayNumber === plan.totalDaysElapsed;
              const date = new Date(day.date);

              return (
                <div
                  key={day.dayNumber}
                  className={`
                    flex items-center justify-between py-2 px-3 rounded-lg
                    ${isToday ? 'bg-[#EEF2F7] ring-1 ring-[#4A90D9]' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#5D6D7E]">
                      {formatDateCN(date)}
                    </span>
                    {isToday && (
                      <span className="text-xs text-[#4A90D9] font-medium">
                        今天
                      </span>
                    )}
                  </div>
                  <Badge
                    variant={carbDayBadgeVariant[day.carbDayType]}
                    size="sm"
                  >
                    {getCarbDayTypeName(day.carbDayType)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Summary Link */}
        {plan.status === 'COMPLETED' && (
          <Link href={`/plan/summary/${plan.id}`}>
            <Card
              variant="success"
              className="mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#2C3E50]">查看周期总结</span>
                <span className="text-[#4A90D9]">→</span>
              </div>
            </Card>
          </Link>
        )}

        {/* Restart Button */}
        <Button
          variant="danger"
          onClick={handleRestart}
          className="w-full"
        >
          重新开始计划
        </Button>
      </PageContainer>

      <BottomNav />
    </>
  );
}
