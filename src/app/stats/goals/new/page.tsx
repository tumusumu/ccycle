'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { GoalForm } from '@/components/metrics';
import { IMetricGoalInput, IUserProfile, IBodyMetrics } from '@/types/user';

export default function NewGoalPage() {
  const router = useRouter();
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [latestMetrics, setLatestMetrics] = useState<IBodyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [userRes, metricsRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/body-metrics/latest'),
      ]);

      if (userRes.ok) {
        setUser(await userRes.json());
      }
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setLatestMetrics(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: IMetricGoalInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create goal');
      }

      router.push('/stats/goals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  // Use latest metrics if available, otherwise use user profile
  const currentWeight = latestMetrics?.weight ?? user?.weight;
  const currentBodyFat = latestMetrics?.bodyFatPercentage ?? user?.bodyFatPercentage;
  const currentMuscleMass = latestMetrics?.muscleMass ?? undefined;

  return (
    <>
      <Header showBack title="创建目标" />

      <PageContainer className="pt-16">
        <Card>
          <h2 className="text-lg font-semibold text-[#2C3E50] mb-4">
            设置新目标
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] text-[#E74C3C] text-sm rounded-[12px]">
              {error}
            </div>
          )}

          <GoalForm
            onSubmit={handleSubmit}
            currentWeight={currentWeight}
            currentBodyFat={currentBodyFat}
            currentMuscleMass={currentMuscleMass}
            isLoading={isSubmitting}
          />
        </Card>

        {/* Info */}
        <div className="mt-4 p-4 bg-[#EEF2F7] rounded-[16px]">
          <h3 className="text-sm font-medium text-[#2C3E50] mb-2">关于目标</h3>
          <ul className="text-xs text-[#5D6D7E] space-y-1">
            <li>- 每种类型只能有一个进行中的目标</li>
            <li>- 达到目标后可以标记为完成</li>
            <li>- 也可以随时取消或调整目标</li>
          </ul>
        </div>
      </PageContainer>
    </>
  );
}
