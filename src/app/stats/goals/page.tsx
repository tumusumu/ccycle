'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GoalCard, IGoalWithProgress } from '@/components/metrics';

interface GoalsData {
  goals: IGoalWithProgress[];
}

export default function GoalsPage() {
  const [activeGoals, setActiveGoals] = useState<IGoalWithProgress[]>([]);
  const [completedGoals, setCompletedGoals] = useState<IGoalWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      const [activeRes, completedRes] = await Promise.all([
        fetch('/api/goals?status=ACTIVE'),
        fetch('/api/goals?status=ACHIEVED'),
      ]);

      if (activeRes.ok) {
        const data: GoalsData = await activeRes.json();
        setActiveGoals(data.goals);
      }
      if (completedRes.ok) {
        const data: GoalsData = await completedRes.json();
        setCompletedGoals(data.goals);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleCancelGoal = async (id: string) => {
    try {
      await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      fetchGoals();
    } catch (err) {
      console.error('Error cancelling goal:', err);
    }
  };

  const handleAchieveGoal = async (id: string) => {
    try {
      await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACHIEVED' }),
      });
      fetchGoals();
    } catch (err) {
      console.error('Error achieving goal:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <Header showBack title="目标管理" />

      <PageContainer className="pt-16">
        {/* Create Goal Button */}
        <Link href="/stats/goals/new" className="block mb-4">
          <Button className="w-full">创建新目标</Button>
        </Link>

        {/* Active Goals */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-[#2C3E50] mb-3">
            进行中 ({activeGoals.length})
          </h2>
          {activeGoals.length > 0 ? (
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onCancel={handleCancelGoal}
                  onAchieve={handleAchieveGoal}
                />
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center text-[#5D6D7E] py-4">
                暂无进行中的目标
              </div>
            </Card>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-[#2C3E50] mb-3">
              已完成 ({completedGoals.length})
            </h2>
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-[#EEF2F7] rounded-[16px]">
          <h3 className="text-sm font-medium text-[#2C3E50] mb-2">目标设置建议</h3>
          <ul className="text-xs text-[#5D6D7E] space-y-1">
            <li>- 每周减重0.5-1kg是健康的速度</li>
            <li>- 体脂率每月降低1-2%较为合理</li>
            <li>- 设置具体的目标日期有助于保持动力</li>
          </ul>
        </div>
      </PageContainer>
    </>
  );
}
