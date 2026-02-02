'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { IBodyMetrics, IUserProfile } from '@/types/user';
import {
  LineChart,
  IDataPoint,
  BMIDisplay,
  GoalCard,
  IGoalWithProgress,
  TrendIndicator,
} from '@/components/metrics';
import { calculateBMI } from '@/utils/bmi';

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
    muscleMass: number | null;
    bmi: number | null;
  }>;
  trends: {
    weightPerWeek: number;
    weightDirection: string;
    bodyFatPerWeek: number | null;
    bodyFatDirection: string | null;
  } | null;
}

interface GoalsData {
  goals: IGoalWithProgress[];
}

export default function StatsPage() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [goalsData, setGoalsData] = useState<GoalsData | null>(null);
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [isHeightModalOpen, setIsHeightModalOpen] = useState(false);
  const [heightInput, setHeightInput] = useState('');
  const [isSavingHeight, setIsSavingHeight] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, trendsRes, goalsRes, userRes] = await Promise.all([
        fetch('/api/body-metrics'),
        fetch(`/api/body-metrics/trends?period=${period}`),
        fetch('/api/goals?status=ACTIVE'),
        fetch('/api/user'),
      ]);

      if (metricsRes.ok) {
        setMetricsData(await metricsRes.json());
      }
      if (trendsRes.ok) {
        setTrendsData(await trendsRes.json());
      }
      if (goalsRes.ok) {
        setGoalsData(await goalsRes.json());
      }
      if (userRes.ok) {
        setUser(await userRes.json());
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

  const handleCancelGoal = async (id: string) => {
    try {
      await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      fetchData();
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
      fetchData();
    } catch (err) {
      console.error('Error achieving goal:', err);
    }
  };

  const handleOpenHeightModal = () => {
    setHeightInput(user?.height?.toString() || '');
    setIsHeightModalOpen(true);
  };

  const handleSaveHeight = async () => {
    const height = parseFloat(heightInput);
    if (isNaN(height) || height <= 0) {
      return;
    }

    setIsSavingHeight(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ height }),
      });
      if (res.ok) {
        setIsHeightModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error('Error saving height:', err);
    } finally {
      setIsSavingHeight(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  const summary = metricsData?.summary;
  const trends = trendsData?.trends;
  const weightData: IDataPoint[] = trendsData?.trendPoints?.map((p) => ({
    date: p.date,
    value: p.weight,
  })) || [];
  const bodyFatData: IDataPoint[] = trendsData?.trendPoints
    ?.filter((p) => p.bodyFatPercentage !== null)
    .map((p) => ({
      date: p.date,
      value: (p.bodyFatPercentage as number) * 100,
    })) || [];

  const currentBMI = user?.height && summary?.currentWeight
    ? calculateBMI(summary.currentWeight, user.height)
    : null;

  return (
    <>
      <Header />

      <PageContainer className="pt-16 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#2C3E50]">身体指标</h1>
          <Link href="/stats/record">
            <Button size="sm">记录</Button>
          </Link>
        </div>

        {/* Active Goals */}
        {goalsData?.goals && goalsData.goals.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-[#2C3E50]">进行中的目标</h2>
              <Link href="/stats/goals" className="text-sm text-[#4A90D9]">
                管理目标
              </Link>
            </div>
            <div className="space-y-3">
              {goalsData.goals.slice(0, 2).map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onCancel={handleCancelGoal}
                  onAchieve={handleAchieveGoal}
                />
              ))}
            </div>
          </div>
        )}

        {/* No goals prompt */}
        {(!goalsData?.goals || goalsData.goals.length === 0) && summary && (
          <Card className="mb-4">
            <div className="text-center py-2">
              <p className="text-[#5D6D7E] text-sm mb-2">设置目标，追踪进度</p>
              <Link href="/stats/goals/new">
                <Button size="sm" variant="secondary">创建目标</Button>
              </Link>
            </div>
          </Card>
        )}

        {summary ? (
          <>
            {/* BMI Card */}
            <Card className="mb-4">
              <div
                className={`flex items-start justify-between ${!user?.height ? 'cursor-pointer' : ''}`}
                onClick={!user?.height ? handleOpenHeightModal : undefined}
              >
                <div className="flex-1">
                  <BMIDisplay bmi={currentBMI} size="md" />
                </div>
                {!user?.height && (
                  <span className="text-xs text-[#4A90D9]">
                    点击设置身高
                  </span>
                )}
              </div>
            </Card>

            {/* Period Selector */}
            <div className="flex gap-2 mb-4">
              {(['week', 'month', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    period === p
                      ? 'bg-[#4A90D9] text-white'
                      : 'bg-white text-[#5D6D7E]'
                  }`}
                >
                  {p === 'week' ? '近7天' : p === 'month' ? '近30天' : '全部'}
                </button>
              ))}
            </div>

            {/* Weight Chart */}
            {weightData.length > 1 && (
              <Card className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-[#2C3E50]">体重趋势</h3>
                  {trends && (
                    <TrendIndicator
                      value={trends.weightPerWeek}
                      unit="kg"
                      positiveIsGood={false}
                      size="sm"
                    />
                  )}
                </div>
                <LineChart
                  data={weightData}
                  color="#4A90D9"
                  height={180}
                  formatValue={(v) => `${v.toFixed(1)}`}
                />
              </Card>
            )}

            {/* Body Fat Chart */}
            {bodyFatData.length > 1 && (
              <Card className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-[#2C3E50]">体脂率趋势</h3>
                  {trends?.bodyFatPerWeek !== null && (
                    <TrendIndicator
                      value={(trends?.bodyFatPerWeek || 0) * 100}
                      unit="%"
                      positiveIsGood={false}
                      size="sm"
                    />
                  )}
                </div>
                <LineChart
                  data={bodyFatData}
                  color="#F5C542"
                  height={180}
                  formatValue={(v) => `${v.toFixed(1)}%`}
                />
              </Card>
            )}

            {/* Summary Stats */}
            <Card className="mb-4">
              <h3 className="text-base font-semibold text-[#2C3E50] mb-4">变化总结</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Weight Change */}
                <div className="bg-[#EEF2F7] rounded-[12px] p-3">
                  <div className="text-xs text-[#5D6D7E] mb-1">体重变化</div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-xl font-bold ${
                        summary.weightChange < 0 ? 'text-[#5CB85C]' : 'text-[#E74C3C]'
                      }`}
                    >
                      {summary.weightChange > 0 ? '+' : ''}
                      {summary.weightChange.toFixed(1)}kg
                    </span>
                  </div>
                  <div className="text-xs text-[#AEB6BF] mt-1">
                    {summary.startWeight}kg → {summary.currentWeight}kg
                  </div>
                </div>

                {/* Body Fat Change */}
                {summary.startBodyFat && summary.currentBodyFat && (
                  <div className="bg-[#EEF2F7] rounded-[12px] p-3">
                    <div className="text-xs text-[#5D6D7E] mb-1">体脂率变化</div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-xl font-bold ${
                          (summary.bodyFatChange ?? 0) < 0
                            ? 'text-[#5CB85C]'
                            : 'text-[#E74C3C]'
                        }`}
                      >
                        {(summary.bodyFatChange ?? 0) > 0 ? '+' : ''}
                        {((summary.bodyFatChange ?? 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-[#AEB6BF] mt-1">
                      {(summary.startBodyFat * 100).toFixed(1)}% →{' '}
                      {(summary.currentBodyFat * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Records List */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#2C3E50]">
                  记录历史 ({summary.totalRecords}条)
                </h3>
                <Link href="/stats/history" className="text-sm text-[#4A90D9]">
                  查看全部
                </Link>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {metricsData?.metrics.slice(-10).reverse().map((metric) => (
                  <div
                    key={metric.id}
                    className="flex justify-between py-2 border-b border-[#EEF2F7] last:border-b-0"
                  >
                    <span className="text-[#5D6D7E]">
                      {new Date(metric.date).toLocaleDateString('zh-CN')}
                    </span>
                    <div className="text-right">
                      <span className="font-medium text-[#2C3E50]">
                        {metric.weight}kg
                      </span>
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
              <p className="text-sm mt-2">开始记录你的身体指标</p>
              <Link href="/stats/record" className="block mt-4">
                <Button>记录第一条</Button>
              </Link>
            </div>
          </Card>
        )}
      </PageContainer>

      {/* Height Setting Modal */}
      <Modal
        isOpen={isHeightModalOpen}
        onClose={() => setIsHeightModalOpen(false)}
        title="设置身高"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-2">
              身高 (cm)
            </label>
            <input
              type="number"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
              placeholder="请输入身高"
              className="w-full px-3 py-2 border border-[#D5DBDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent"
              min="100"
              max="250"
              step="0.1"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setIsHeightModalOpen(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveHeight}
              disabled={isSavingHeight || !heightInput}
            >
              {isSavingHeight ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav />
    </>
  );
}
