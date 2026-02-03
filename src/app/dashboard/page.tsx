'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { TCarbDayType } from '@/types/plan';
import { getCarbDayTypeName } from '@/utils/carbon-cycle';
import { useIntake } from '@/context/intake-context';
import { FOOD_NAMES } from '@/constants/nutrition';
import {
  getReferencePortions,
  calculateTargets,
  calculateDailyNutrition,
  intakeToMealsData,
  IUserData,
} from '@/lib/nutrition-calculator';

interface TodayData {
  date: string;
  dayNumber: number;
  carbDayType: TCarbDayType;
}

const carbDayBadgeVariant: Record<TCarbDayType, 'low' | 'medium' | 'high'> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export default function DashboardPage() {
  const router = useRouter();
  const { intake, isLoading: intakeLoading } = useIntake();
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planNotStarted, setPlanNotStarted] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch user data
      const userRes = await fetch('/api/user');
      if (!userRes.ok) {
        router.push('/onboarding');
        return;
      }
      const user = await userRes.json();

      // 检查用户是否已完成 onboarding（体重和体脂率不为0）
      if (!user.weight || user.weight === 0 || !user.bodyFatPercentage || user.bodyFatPercentage === 0) {
        router.push('/onboarding');
        return;
      }

      setUserData({
        weight: user.weight,
        bodyFatPercentage: user.bodyFatPercentage,
      });

      // Fetch today's plan
      const res = await fetch('/api/daily-plan/today');
      const data = await res.json();

      if (res.status === 404) {
        if (data.code === 'NO_USER') {
          router.push('/onboarding');
          return;
        }
        if (data.code === 'NO_PLAN') {
          router.push('/plan/new');
          return;
        }
        throw new Error(data.error || 'Failed to fetch today data');
      }

      if (data.code === 'PLAN_NOT_STARTED') {
        setPlanNotStarted(data.startDate);
        return;
      }

      setTodayData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate targets and totals using centralized nutrition calculator
  const { references, targets, totalNutrition } = useMemo(() => {
    if (!userData || !todayData) {
      return { references: null, targets: null, totalNutrition: null };
    }

    const carbDayType = todayData.carbDayType;

    // Get reference portions from centralized module
    const refs = getReferencePortions(carbDayType);

    // Calculate targets from centralized module
    const calculatedTargets = calculateTargets(userData, carbDayType);

    // Convert intake to meals data and calculate daily nutrition
    const mealsData = intakeToMealsData(intake);
    const dailyNutrition = calculateDailyNutrition(mealsData);

    return {
      references: refs,
      targets: {
        carbs: calculatedTargets.carbs,
        protein: calculatedTargets.protein,
        fat: calculatedTargets.fat,
        calories: calculatedTargets.calories,
      },
      totalNutrition: dailyNutrition,
    };
  }, [userData, todayData, intake]);

  if (isLoading || intakeLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  if (planNotStarted) {
    return (
      <>
        <Header showLogout />
        <PageContainer className="pt-16">
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-xl font-bold text-[#2C3E50] mb-2">计划尚未开始</h2>
            <p className="text-[#5D6D7E] mb-6">
              你的碳循环计划将于 <span className="font-semibold text-[#4A90D9]">{planNotStarted}</span> 开始
            </p>
          </div>
        </PageContainer>
        <BottomNav />
      </>
    );
  }

  if (error || !todayData || !userData || !references || !targets || !totalNutrition) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center p-4">
        <Card variant="warning">
          <p className="text-[#E74C3C]">{error || 'No data available'}</p>
          <Button onClick={() => router.push('/onboarding')} className="mt-4 w-full">
            开始设置
          </Button>
        </Card>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  // Format display text for each meal
  const breakfastDisplay = intake.breakfastCompleted
    ? `燕麦 ${intake.oatmealGrams}g · 含黄${intake.wholeEggs}个 去黄${intake.whiteOnlyEggs}个`
    : `燕麦 ${references.oatmeal}g · 含黄${references.wholeEggs}个 去黄${references.whiteOnlyEggs}个`;

  const lunchDisplay = intake.lunchCompleted
    ? `米饭 ${intake.lunchRiceGrams}g · ${intake.lunchMeatType ? FOOD_NAMES[intake.lunchMeatType] : '肉菜'} ${intake.lunchMeatGrams}g`
    : `米饭 ${references.lunchRice}g · 肉菜 约${references.lunchMeat}g`;

  // Snack display varies by carb day (default to protein powder 28g)
  const snackDisplay = intake.snackCompleted
    ? references.snackRice > 0
      ? `米饭 ${intake.snackRiceGrams}g · ${intake.snackMeatType ? FOOD_NAMES[intake.snackMeatType] : '蛋白粉'} ${intake.snackMeatGrams}g`
      : `${intake.snackMeatType ? FOOD_NAMES[intake.snackMeatType] : '蛋白粉'} ${intake.snackMeatGrams}g`
    : references.snackRice > 0
      ? `米饭 ${references.snackRice}g · 蛋白粉 28g`
      : `蛋白粉 28g`;

  const dinnerDisplay = intake.dinnerCompleted
    ? `米饭 ${intake.dinnerRiceGrams}g · ${intake.dinnerMeatType ? FOOD_NAMES[intake.dinnerMeatType] : '肉菜'} ${intake.dinnerMeatGrams}g`
    : `米饭 ${references.dinnerRice}g · 肉菜 约${references.dinnerMeat}g`;

  const strengthDisplay = intake.strengthCompleted
    ? `已完成 ${intake.strengthMinutes} 分钟`
    : `建议 ${references.strengthMin}${references.strengthMin !== references.strengthMax ? `-${references.strengthMax}` : ''} min`;

  const cardioDisplay = intake.cardioCompleted
    ? `已完成 ${intake.cardioMinutes} 分钟`
    : `建议 ${references.cardioMin}${references.cardioMin !== references.cardioMax ? `-${references.cardioMax}` : ''} min`;

  return (
    <>
      <Header currentCarbDay={todayData.carbDayType} dayNumber={todayData.dayNumber} showLogout />

      <PageContainer className="pt-16 pb-24">
        {/* Top: Date + Badge + Nutrition Rings */}
        <Card className="mb-3 !p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#5D6D7E]">{today}</span>
              <Badge variant={carbDayBadgeVariant[todayData.carbDayType]} size="sm">
                {getCarbDayTypeName(todayData.carbDayType)}
              </Badge>
            </div>
            <span className="text-xs text-[#AEB6BF]">第{todayData.dayNumber}天</span>
          </div>
          <div className="flex justify-around">
            <ProgressRing value={Math.round(totalNutrition.carbs)} max={targets.carbs} color="carb" label="碳水" size="sm" />
            <ProgressRing value={Math.round(totalNutrition.protein)} max={targets.protein} color="protein" label="蛋白质" size="sm" />
            <ProgressRing value={Math.round(totalNutrition.fat)} max={targets.fat} color="fat" label="脂肪" size="sm" />
            <ProgressRing value={Math.round(totalNutrition.calories)} max={targets.calories} color="calories" label="热量" unit="" size="sm" />
          </div>
        </Card>

        {/* Breakfast Card */}
        <Link href="/meals/breakfast">
          <Card className="mb-2 !py-3 !px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg shrink-0">🌅</span>
                <span className="text-sm font-medium text-[#2C3E50] shrink-0">早餐</span>
                <span className="text-xs text-[#5D6D7E] truncate">{breakfastDisplay}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {intake.breakfastCompleted ? (
                  <span className="text-xs text-[#27AE60] font-medium">✓ 已完成</span>
                ) : (
                  <>
                    <span className="text-xs text-[#AEB6BF]">未完成</span>
                    <span className="text-xs text-[#4A90D9]">录入 →</span>
                  </>
                )}
              </div>
            </div>
          </Card>
        </Link>

        {/* Lunch Card */}
        <Link href="/meals/lunch">
          <Card className="mb-2 !py-3 !px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg shrink-0">☀️</span>
                <span className="text-sm font-medium text-[#2C3E50] shrink-0">午餐</span>
                <span className="text-xs text-[#5D6D7E] truncate">{lunchDisplay}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {intake.lunchCompleted ? (
                  <span className="text-xs text-[#27AE60] font-medium">✓ 已完成</span>
                ) : (
                  <>
                    <span className="text-xs text-[#AEB6BF]">未完成</span>
                    <span className="text-xs text-[#4A90D9]">录入 →</span>
                  </>
                )}
              </div>
            </div>
          </Card>
        </Link>

        {/* Snack Card */}
        <Link href="/meals/snack">
          <Card className="mb-2 !py-3 !px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg shrink-0">🍵</span>
                <span className="text-sm font-medium text-[#2C3E50] shrink-0">加餐</span>
                <span className="text-xs text-[#5D6D7E] truncate">{snackDisplay}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {intake.snackCompleted ? (
                  <span className="text-xs text-[#27AE60] font-medium">✓ 已完成</span>
                ) : (
                  <>
                    <span className="text-xs text-[#AEB6BF]">未完成</span>
                    <span className="text-xs text-[#4A90D9]">录入 →</span>
                  </>
                )}
              </div>
            </div>
          </Card>
        </Link>

        {/* Dinner Card */}
        <Link href="/meals/dinner">
          <Card className="mb-2 !py-3 !px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg shrink-0">🌙</span>
                <span className="text-sm font-medium text-[#2C3E50] shrink-0">晚餐</span>
                <span className="text-xs text-[#5D6D7E] truncate">{dinnerDisplay}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {intake.dinnerCompleted ? (
                  <span className="text-xs text-[#27AE60] font-medium">✓ 已完成</span>
                ) : (
                  <>
                    <span className="text-xs text-[#AEB6BF]">未完成</span>
                    <span className="text-xs text-[#4A90D9]">录入 →</span>
                  </>
                )}
              </div>
            </div>
          </Card>
        </Link>

        {/* Strength Training Card */}
        <Link href="/exercise/strength">
          <Card className="mb-2 !py-3 !px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg shrink-0">🏋️</span>
                <span className="text-sm font-medium text-[#2C3E50] shrink-0">力量训练</span>
                <span className="text-xs text-[#5D6D7E] truncate">{strengthDisplay}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {intake.strengthCompleted ? (
                  <span className="text-xs text-[#27AE60] font-medium">✓ 已完成</span>
                ) : (
                  <>
                    <span className="text-xs text-[#AEB6BF]">未完成</span>
                    <span className="text-xs text-[#4A90D9]">录入 →</span>
                  </>
                )}
              </div>
            </div>
          </Card>
        </Link>

        {/* Cardio Training Card */}
        <Link href="/exercise/cardio">
          <Card className="mb-2 !py-3 !px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg shrink-0">🏃</span>
                <span className="text-sm font-medium text-[#2C3E50] shrink-0">有氧训练</span>
                <span className="text-xs text-[#5D6D7E] truncate">{cardioDisplay}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {intake.cardioCompleted ? (
                  <span className="text-xs text-[#27AE60] font-medium">✓ 已完成</span>
                ) : (
                  <>
                    <span className="text-xs text-[#AEB6BF]">未完成</span>
                    <span className="text-xs text-[#4A90D9]">录入 →</span>
                  </>
                )}
              </div>
            </div>
          </Card>
        </Link>

        {/* 橄榄油摄入状态 - 仅在低碳日和中碳日显示 */}
        {references && references.oliveOilMl > 0 && (
          <Card className="mt-3 !py-3 !px-4">
            {(() => {
              const totalOliveOil = (intake.lunchOliveOilMl || 0) + (intake.dinnerOliveOilMl || 0);
              const target = references.oliveOilMl;
              const isComplete = totalOliveOil >= target;
              const percentage = Math.min(100, Math.round((totalOliveOil / target) * 100));

              return (
                <div className="flex items-center gap-3">
                  <span className="text-lg">🫒</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#2C3E50]">橄榄油</span>
                      <span className={`text-sm font-medium ${isComplete ? 'text-[#27AE60]' : 'text-[#F59E0B]'}`}>
                        {totalOliveOil} / {target} ml
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isComplete ? 'bg-[#27AE60]' : 'bg-[#F59E0B]'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-[#5D6D7E]">
                      <span>午餐 {intake.lunchOliveOilMl || 0}ml</span>
                      <span>晚餐 {intake.dinnerOliveOilMl || 0}ml</span>
                    </div>
                  </div>
                  {isComplete ? (
                    <span className="text-[#27AE60] text-sm">✓</span>
                  ) : (
                    <span className="text-[#F59E0B] text-xs">还需 {target - totalOliveOil}ml</span>
                  )}
                </div>
              );
            })()}
          </Card>
        )}

      </PageContainer>

      <BottomNav />
    </>
  );
}
