'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { MetricInputForm } from '@/components/metrics';
import { IBodyMetricsInput, IUserProfile, IBodyMetrics } from '@/types/user';

export default function RecordMetricsPage() {
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

  const handleSubmit = async (data: IBodyMetricsInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/body-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to record metrics');
      }

      router.push('/stats');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record metrics');
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

  return (
    <>
      <Header showBack title="记录身体指标" />

      <PageContainer className="pt-16">
        <Card>
          <h2 className="text-lg font-semibold text-[#2C3E50] mb-4">
            今日记录
          </h2>
          <p className="text-sm text-[#5D6D7E] mb-4">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] text-[#E74C3C] text-sm rounded-[12px]">
              {error}
            </div>
          )}

          <MetricInputForm
            onSubmit={handleSubmit}
            initialWeight={latestMetrics?.weight ?? user?.weight}
            initialBodyFat={latestMetrics?.bodyFatPercentage ?? user?.bodyFatPercentage}
            initialMuscleMass={latestMetrics?.muscleMass ?? undefined}
            initialWaistCircumference={latestMetrics?.waistCircumference ?? undefined}
            isLoading={isSubmitting}
          />
        </Card>

        {/* Tips */}
        <div className="mt-4 p-4 bg-[#F0FDF4] rounded-[16px]">
          <h3 className="text-sm font-medium text-[#2C3E50] mb-2">记录建议</h3>
          <ul className="text-xs text-[#5D6D7E] space-y-1">
            <li>- 每天同一时间测量（建议早起空腹后）</li>
            <li>- 体脂率建议使用专业设备测量</li>
            <li>- 保持记录频率，便于观察趋势</li>
          </ul>
        </div>
      </PageContainer>
    </>
  );
}
