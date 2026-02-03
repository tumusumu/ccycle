'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface TrendsData {
  trendPoints: Array<{
    date: string;
    weight: number;
    bodyFatPercentage: number | null;
  }>;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  weight: number;
  bodyFat: number | null;
}

// Custom tooltip component
interface ICustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: ICustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-[#EEF2F7]">
        <p className="text-sm text-[#2C3E50] font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toFixed(1)}
            {entry.name === '体脂率' ? '%' : 'kg'}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function StatsPage() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [showHistory, setShowHistory] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, trendsRes] = await Promise.all([
        fetch('/api/body-metrics'),
        fetch(`/api/body-metrics/trends?period=${period}`),
      ]);

      if (metricsRes.ok) {
        setMetricsData(await metricsRes.json());
      }
      if (trendsRes.ok) {
        setTrendsData(await trendsRes.json());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  const summary = metricsData?.summary;
  const metrics = metricsData?.metrics || [];

  // Prepare chart data
  const chartData: ChartDataPoint[] = trendsData?.trendPoints?.map((p) => ({
    date: new Date(p.date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    displayDate: new Date(p.date).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    }),
    weight: p.weight,
    bodyFat: p.bodyFatPercentage ? Math.round(p.bodyFatPercentage * 10000) / 100 : null,
  })) || [];

  // Calculate Y axis domains with padding
  const weights = chartData.map((d) => d.weight);
  const bodyFats = chartData.map((d) => d.bodyFat).filter((v): v is number => v !== null);

  const weightMin = weights.length > 0 ? Math.floor(Math.min(...weights) - 2) : 0;
  const weightMax = weights.length > 0 ? Math.ceil(Math.max(...weights) + 2) : 100;
  const bodyFatMin = bodyFats.length > 0 ? Math.floor(Math.min(...bodyFats) - 2) : 0;
  const bodyFatMax = bodyFats.length > 0 ? Math.ceil(Math.max(...bodyFats) + 2) : 50;

  const hasData = summary !== null;
  const hasChartData = chartData.length >= 2;

  return (
    <>
      <Header showLogout />

      <PageContainer className="pt-16 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#2C3E50]">身体指标</h1>
          <Link href="/stats/record">
            <Button size="sm">记录</Button>
          </Link>
        </div>

        {hasData ? (
          <>
            {/* Period Selector */}
            <div className="flex gap-2 mb-4">
              {(['week', 'month', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${
                    period === p
                      ? 'bg-[#4A90D9] text-white'
                      : 'bg-white text-[#5D6D7E] hover:bg-[#F8F9FA]'
                  }`}
                >
                  {p === 'week' ? '近7天' : p === 'month' ? '近30天' : '全部'}
                </button>
              ))}
            </div>

            {/* Trend Chart */}
            <Card className="mb-4">
              <h3 className="text-base font-semibold text-[#2C3E50] mb-4">趋势图表</h3>

              {hasChartData ? (
                <div className="h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#E5E8EB"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="displayDate"
                        tick={{ fontSize: 12, fill: '#5D6D7E' }}
                        tickLine={false}
                        axisLine={{ stroke: '#E5E8EB' }}
                      />
                      <YAxis
                        yAxisId="weight"
                        orientation="left"
                        domain={[weightMin, weightMax]}
                        tick={{ fontSize: 12, fill: '#4A90D9' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}`}
                        width={35}
                      />
                      <YAxis
                        yAxisId="bodyFat"
                        orientation="right"
                        domain={[bodyFatMin, bodyFatMax]}
                        tick={{ fontSize: 12, fill: '#E8A0BF' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                        width={40}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        labelFormatter={(label) => {
                          const point = chartData.find((d) => d.displayDate === label);
                          return point?.date || label;
                        }}
                      />
                      <Line
                        yAxisId="weight"
                        type="monotone"
                        dataKey="weight"
                        name="体重"
                        stroke="#4A90D9"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#4A90D9', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#4A90D9', strokeWidth: 2, stroke: '#fff' }}
                      />
                      <Line
                        yAxisId="bodyFat"
                        type="monotone"
                        dataKey="bodyFat"
                        name="体脂率"
                        stroke="#E8A0BF"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#E8A0BF', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#E8A0BF', strokeWidth: 2, stroke: '#fff' }}
                        connectNulls
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-[#5D6D7E] text-sm">
                  需要至少2条记录才能显示趋势图
                </div>
              )}

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-[#EEF2F7]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#4A90D9]" />
                  <span className="text-sm text-[#5D6D7E]">体重 (kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E8A0BF]" />
                  <span className="text-sm text-[#5D6D7E]">体脂率 (%)</span>
                </div>
              </div>
            </Card>

            {/* Summary Stats */}
            <Card className="mb-4">
              <h3 className="text-base font-semibold text-[#2C3E50] mb-4">数据摘要</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Weight Change */}
                <div className="bg-[#F0F7FF] rounded-[12px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#4A90D9]" />
                    <span className="text-xs text-[#5D6D7E]">体重变化</span>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      (summary?.weightChange ?? 0) < 0 ? 'text-[#5CB85C]' : (summary?.weightChange ?? 0) > 0 ? 'text-[#E74C3C]' : 'text-[#2C3E50]'
                    }`}
                  >
                    {(summary?.weightChange ?? 0) > 0 ? '+' : ''}
                    {(summary?.weightChange ?? 0).toFixed(1)}kg
                  </div>
                  <div className="text-xs text-[#AEB6BF] mt-1">
                    {(summary?.startWeight ?? 0).toFixed(1)} → {(summary?.currentWeight ?? 0).toFixed(1)} kg
                  </div>
                </div>

                {/* Body Fat Change */}
                <div className="bg-[#FDF2F8] rounded-[12px] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#E8A0BF]" />
                    <span className="text-xs text-[#5D6D7E]">体脂率变化</span>
                  </div>
                  {summary?.startBodyFat && summary?.currentBodyFat ? (
                    <>
                      <div
                        className={`text-2xl font-bold ${
                          (summary?.bodyFatChange ?? 0) < 0 ? 'text-[#5CB85C]' : (summary?.bodyFatChange ?? 0) > 0 ? 'text-[#E74C3C]' : 'text-[#2C3E50]'
                        }`}
                      >
                        {(summary?.bodyFatChange ?? 0) > 0 ? '+' : ''}
                        {((summary?.bodyFatChange ?? 0) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-[#AEB6BF] mt-1">
                        {(summary.startBodyFat * 100).toFixed(1)} → {(summary.currentBodyFat * 100).toFixed(1)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-[#AEB6BF]">暂无数据</div>
                  )}
                </div>
              </div>
            </Card>

            {/* Records List (Collapsible) */}
            <Card>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="text-base font-semibold text-[#2C3E50]">
                  历史记录 ({summary?.totalRecords ?? 0}条)
                </h3>
                <svg
                  className={`w-5 h-5 text-[#5D6D7E] transition-transform ${showHistory ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showHistory && (
                <div className="mt-4 space-y-2">
                  {/* Table Header */}
                  <div className="flex justify-between text-xs text-[#AEB6BF] pb-2 border-b border-[#EEF2F7]">
                    <span>日期</span>
                    <div className="flex gap-6">
                      <span className="w-16 text-right">体重</span>
                      <span className="w-16 text-right">体脂率</span>
                    </div>
                  </div>

                  {/* Records */}
                  {metrics.slice(-10).reverse().map((metric) => (
                    <div
                      key={metric.id}
                      className="flex justify-between py-2 border-b border-[#EEF2F7] last:border-b-0"
                    >
                      <span className="text-sm text-[#5D6D7E]">
                        {new Date(metric.date).toLocaleDateString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </span>
                      <div className="flex gap-6">
                        <span className="w-16 text-right font-medium text-[#4A90D9]">
                          {metric.weight.toFixed(1)}kg
                        </span>
                        <span className="w-16 text-right font-medium text-[#E8A0BF]">
                          {metric.bodyFatPercentage
                            ? `${(metric.bodyFatPercentage * 100).toFixed(1)}%`
                            : '-'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {(summary?.totalRecords ?? 0) > 10 && (
                    <Link
                      href="/stats/history"
                      className="block text-center text-sm text-[#4A90D9] pt-2 hover:underline"
                    >
                      查看全部 {summary?.totalRecords} 条记录
                    </Link>
                  )}
                </div>
              )}
            </Card>
          </>
        ) : (
          /* Empty State */
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#EEF2F7] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#AEB6BF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-[#2C3E50] font-medium mb-1">暂无数据</p>
              <p className="text-sm text-[#5D6D7E] mb-6">开始记录你的第一条数据吧</p>
              <Link href="/stats/record">
                <Button>记录第一条</Button>
              </Link>
            </div>
          </Card>
        )}
      </PageContainer>

      <BottomNav />
    </>
  );
}
