'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { MetricInputForm } from '@/components/metrics';
import { IBodyMetricsInput, IUserProfile, IBodyMetrics } from '@/types/user';

type RecordMode = 'today' | 'backfill';

export default function RecordMetricsPage() {
  const router = useRouter();
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [latestMetrics, setLatestMetrics] = useState<IBodyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RecordMode>('today');

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

  const today = new Date();
  const todayStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <>
      <Header showBack title="记录身体指标" />

      <PageContainer className="pt-16">
        {/* Mode Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('today')}
            className={`flex-1 py-2.5 text-sm rounded-full transition-colors ${
              mode === 'today'
                ? 'bg-[#4A90D9] text-white'
                : 'bg-white text-[#5D6D7E] hover:bg-[#F8F9FA]'
            }`}
          >
            今日记录
          </button>
          <button
            onClick={() => setMode('backfill')}
            className={`flex-1 py-2.5 text-sm rounded-full transition-colors ${
              mode === 'backfill'
                ? 'bg-[#4A90D9] text-white'
                : 'bg-white text-[#5D6D7E] hover:bg-[#F8F9FA]'
            }`}
          >
            补充记录
          </button>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-[#2C3E50] mb-2">
            {mode === 'today' ? '今日记录' : '补充历史记录'}
          </h2>
          {mode === 'today' ? (
            <p className="text-sm text-[#5D6D7E] mb-4">{todayStr}</p>
          ) : (
            <p className="text-sm text-[#5D6D7E] mb-4">
              选择日期补充之前遗漏的记录
            </p>
          )}

          {error && (
            <div className="mb-4 p-3 bg-[#FEF2F2] text-[#E74C3C] text-sm rounded-[12px]">
              {error}
            </div>
          )}

          <MetricInputForm
            onSubmit={handleSubmit}
            initialWeight={latestMetrics?.weight ?? user?.weight}
            initialBodyFat={latestMetrics?.bodyFatPercentage ?? user?.bodyFatPercentage}
            showDatePicker={mode === 'backfill'}
            isLoading={isSubmitting}
          />
        </Card>

        {/* Tips */}
        <div className="mt-4 p-4 bg-[#F0FDF4] rounded-[16px]">
          <h3 className="text-sm font-medium text-[#2C3E50] mb-2">
            {mode === 'today' ? '记录建议' : '补充记录说明'}
          </h3>
          <ul className="text-xs text-[#5D6D7E] space-y-1">
            {mode === 'today' ? (
              <>
                <li>- 每天同一时间测量（建议早起空腹后）</li>
                <li>- 体脂率建议使用专业设备测量</li>
                <li>- 保持记录频率，便于观察趋势</li>
              </>
            ) : (
              <>
                <li>- 选择需要补充的日期</li>
                <li>- 同一日期的记录会被覆盖更新</li>
                <li>- 建议按实际测量数据填写</li>
              </>
            )}
          </ul>
        </div>
      </PageContainer>
    </>
  );
}
