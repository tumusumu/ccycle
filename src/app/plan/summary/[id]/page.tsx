'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateCN } from '@/utils/date';
import { ICycleSummary } from '@/types/plan';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SummaryPage({ params }: PageProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<ICycleSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      setPlanId(p.id);
    });
  }, [params]);

  const fetchSummary = useCallback(async () => {
    if (!planId) return;

    try {
      const res = await fetch(`/api/summary/${planId}`);
      if (res.status === 404) {
        // Generate summary if not exists
        await fetch(`/api/summary/${planId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        // Fetch again
        const res2 = await fetch(`/api/summary/${planId}`);
        if (!res2.ok) throw new Error('Failed to fetch');
        const data = await res2.json();
        setSummary(data);
      } else if (!res.ok) {
        throw new Error('Failed to fetch');
      } else {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    if (planId) {
      fetchSummary();
    }
  }, [planId, fetchSummary]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center p-4">
        <Card>
          <p className="text-[#5D6D7E]">暂无总结数据</p>
          <Button onClick={() => router.push('/plan')} className="mt-4 w-full">
            返回计划页
          </Button>
        </Card>
      </div>
    );
  }

  const completionRate = Math.round(
    (summary.daysFollowed / summary.totalDays) * 100
  );
  const weightChange = summary.endWeight
    ? summary.endWeight - summary.startWeight
    : null;
  const bodyFatChange =
    summary.endBodyFat && summary.startBodyFat
      ? summary.endBodyFat - summary.startBodyFat
      : null;

  return (
    <>
      <Header />

      <PageContainer className="pt-16">
        <h1 className="text-2xl font-bold text-[#2C3E50] mb-4">周期总结</h1>

        {/* Overall Stats */}
        <Card className="mb-4">
          <h3 className="font-semibold text-[#2C3E50] mb-4">总体数据</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#4A90D9]">
                {summary.totalDays}
              </div>
              <div className="text-xs text-[#5D6D7E]">总天数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#5CB85C]">
                {summary.daysFollowed}
              </div>
              <div className="text-xs text-[#5D6D7E]">完成天数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#E8A0BF]">
                {completionRate}%
              </div>
              <div className="text-xs text-[#5D6D7E]">完成率</div>
            </div>
          </div>
        </Card>

        {/* Weight Change */}
        <Card className="mb-4">
          <h3 className="font-semibold text-[#2C3E50] mb-4">体重变化</h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-sm text-[#5D6D7E]">起始</div>
              <div className="text-lg font-bold text-[#2C3E50]">{summary.startWeight}kg</div>
            </div>
            <div className="text-2xl text-[#AEB6BF]">→</div>
            <div className="text-center">
              <div className="text-sm text-[#5D6D7E]">结束</div>
              <div className="text-lg font-bold text-[#2C3E50]">
                {summary.endWeight ?? '-'}kg
              </div>
            </div>
            {weightChange !== null && (
              <Badge
                variant={weightChange < 0 ? 'success' : 'error'}
                size="lg"
              >
                {weightChange > 0 ? '+' : ''}
                {weightChange.toFixed(1)}kg
              </Badge>
            )}
          </div>
        </Card>

        {/* Body Fat Change */}
        {summary.startBodyFat && (
          <Card className="mb-4">
            <h3 className="font-semibold text-[#2C3E50] mb-4">体脂变化</h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-sm text-[#5D6D7E]">起始</div>
                <div className="text-lg font-bold text-[#2C3E50]">
                  {(summary.startBodyFat * 100).toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl text-[#AEB6BF]">→</div>
              <div className="text-center">
                <div className="text-sm text-[#5D6D7E]">结束</div>
                <div className="text-lg font-bold text-[#2C3E50]">
                  {summary.endBodyFat
                    ? `${(summary.endBodyFat * 100).toFixed(1)}%`
                    : '-'}
                </div>
              </div>
              {bodyFatChange !== null && (
                <Badge
                  variant={bodyFatChange < 0 ? 'success' : 'error'}
                  size="lg"
                >
                  {bodyFatChange > 0 ? '+' : ''}
                  {(bodyFatChange * 100).toFixed(1)}%
                </Badge>
              )}
            </div>
          </Card>
        )}

        {/* Not Followed Days */}
        {summary.daysNotFollowed > 0 && (
          <Card variant="warning" className="mb-4">
            <h3 className="font-semibold text-[#E74C3C] mb-4">
              未完成日期 ({summary.daysNotFollowed}天)
            </h3>
            <div className="flex flex-wrap gap-2">
              {summary.notFollowedDates.map((date, index) => (
                <Badge key={index} variant="error" size="sm">
                  {formatDateCN(new Date(date))}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button onClick={() => router.push('/onboarding')} className="w-full">
            开始新周期
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push('/plan')}
            className="w-full"
          >
            返回计划页
          </Button>
        </div>
      </PageContainer>

      <BottomNav />
    </>
  );
}
