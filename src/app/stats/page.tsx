'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { IBodyMetrics } from '@/types/user';

interface MetricsData {
  metrics: IBodyMetrics[];
  summary: {
    startWeight: number;
    currentWeight: number;
    weightChange: number;
    startBodyFat: number | null;
    currentBodyFat: number | null;
    bodyFatChange: number | null;
    totalRecords: number;
  } | null;
}

export default function StatsPage() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/body-metrics');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <>
      <Header />

      <PageContainer className="pt-16">
        <h1 className="text-2xl font-bold text-[#2C3E50] mb-4">身体指标</h1>

        {summary ? (
          <>
            {/* Weight Summary */}
            <Card className="mb-4">
              <h3 className="text-base font-semibold text-[#2C3E50] mb-4">体重变化</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-[#5D6D7E]">起始</div>
                  <div className="text-xl font-bold text-[#2C3E50]">{summary.startWeight}kg</div>
                </div>
                <div>
                  <div className="text-sm text-[#5D6D7E]">当前</div>
                  <div className="text-xl font-bold text-[#2C3E50]">{summary.currentWeight}kg</div>
                </div>
                <div>
                  <div className="text-sm text-[#5D6D7E]">变化</div>
                  <div
                    className={`text-xl font-bold ${
                      summary.weightChange < 0 ? 'text-[#5CB85C]' : 'text-[#E74C3C]'
                    }`}
                  >
                    {summary.weightChange > 0 ? '+' : ''}
                    {summary.weightChange.toFixed(1)}kg
                  </div>
                </div>
              </div>
            </Card>

            {/* Body Fat Summary */}
            {summary.startBodyFat && summary.currentBodyFat && (
              <Card className="mb-4">
                <h3 className="text-base font-semibold text-[#2C3E50] mb-4">体脂率变化</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-[#5D6D7E]">起始</div>
                    <div className="text-xl font-bold text-[#2C3E50]">
                      {(summary.startBodyFat * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#5D6D7E]">当前</div>
                    <div className="text-xl font-bold text-[#2C3E50]">
                      {(summary.currentBodyFat * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#5D6D7E]">变化</div>
                    <div
                      className={`text-xl font-bold ${
                        (summary.bodyFatChange ?? 0) < 0
                          ? 'text-[#5CB85C]'
                          : 'text-[#E74C3C]'
                      }`}
                    >
                      {(summary.bodyFatChange ?? 0) > 0 ? '+' : ''}
                      {((summary.bodyFatChange ?? 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Records List */}
            <Card>
              <h3 className="text-base font-semibold text-[#2C3E50] mb-4">
                记录历史 ({summary.totalRecords}条)
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data?.metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex justify-between py-2 border-b border-[#EEF2F7] last:border-b-0"
                  >
                    <span className="text-[#5D6D7E]">
                      {new Date(metric.date).toLocaleDateString('zh-CN')}
                    </span>
                    <div className="text-right">
                      <span className="font-medium text-[#2C3E50]">{metric.weight}kg</span>
                      {metric.bodyFatPercentage && (
                        <span className="text-[#5D6D7E] ml-2">
                          {(metric.bodyFatPercentage * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <div className="text-center text-[#5D6D7E] py-8">
              暂无记录数据
              <p className="text-sm mt-2">完成每日打卡时记录体重</p>
            </div>
          </Card>
        )}
      </PageContainer>

      <BottomNav />
    </>
  );
}
