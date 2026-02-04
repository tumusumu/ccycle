'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from '@/components/ui/progress-ring';
import { TCarbDayType } from '@/types/plan';
import { getCarbDayTypeName } from '@/utils/carbon-cycle';
import {
  calculateTargets,
  calculateDailyNutrition,
  IUserData,
} from '@/lib/nutrition-calculator';
import { IMealIntake } from '@/context/intake-context';

const carbDayBadgeVariant: Record<TCarbDayType, 'low' | 'medium' | 'high'> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// 默认intake数据
const defaultIntake: IMealIntake = {
  oatmealGrams: 0,
  wholeEggs: 0,
  whiteOnlyEggs: 0,
  breakfastCompleted: false,
  lunchRiceGrams: 0,
  lunchMeatType: '',
  lunchMeatGrams: 0,
  lunchOliveOilMl: 0,
  lunchCompleted: false,
  snackRiceGrams: 0,
  snackMeatType: '',
  snackMeatGrams: 0,
  snackCompleted: false,
  dinnerRiceGrams: 0,
  dinnerMeatType: '',
  dinnerMeatGrams: 0,
  dinnerOliveOilMl: 0,
  dinnerCompleted: false,
  strengthMinutes: 0,
  strengthCompleted: false,
  cardioMinutes: 0,
  cardioCompleted: false,
};

export default function HistoryIntakePage() {
  const router = useRouter();
  const params = useParams();
  const targetDate = params.date as string; // YYYY-MM-DD
  
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [carbDayType, setCarbDayType] = useState<TCarbDayType>('LOW');
  const [intake, setIntake] = useState<IMealIntake>(defaultIntake);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 控糖打卡状态
  const [noFruit, setNoFruit] = useState(false);
  const [noSugar, setNoSugar] = useState(false);
  const [noWhiteFlour, setNoWhiteFlour] = useState(false);

  // 格式化日期显示
  const formattedDate = useMemo(() => {
    const date = new Date(targetDate + 'T00:00:00');
    return {
      long: date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }),
      short: date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      }),
    };
  }, [targetDate]);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      // 获取用户数据
      const userRes = await fetch('/api/user');
      if (userRes.ok) {
        const user = await userRes.json();
        setUserData({
          weight: user.weight,
          bodyFatPercentage: user.bodyFatPercentage,
        });
      }

      // 获取该日期的计划和数据
      const planRes = await fetch(`/api/daily-plan/${targetDate}`);
      if (planRes.ok) {
        const planData = await planRes.json();
        setCarbDayType(planData.carbDayType || 'LOW');
      }

      // 尝试加载已有的intake数据
      const intakeRes = await fetch(`/api/intake-history/${targetDate}`);
      if (intakeRes.ok) {
        const intakeData = await intakeRes.json();
        if (intakeData.intake) {
          setIntake(intakeData.intake);
          // 同步到localStorage
          const key = `intake-history-${targetDate}`;
          localStorage.setItem(key, JSON.stringify(intakeData.intake));
        }
        // 加载控糖打卡数据
        if (intakeData.dietRestrictions) {
          setNoFruit(intakeData.dietRestrictions.noFruit);
          setNoSugar(intakeData.dietRestrictions.noSugar);
          setNoWhiteFlour(intakeData.dietRestrictions.noWhiteFlour);
        }
      }
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 保存到localStorage和数据库
  const saveIntake = useCallback(async (updates: Partial<IMealIntake>) => {
    const newIntake = { ...intake, ...updates };
    setIntake(newIntake);

    // 保存到localStorage
    const key = `intake-history-${targetDate}`;
    localStorage.setItem(key, JSON.stringify(newIntake));

    // 保存到数据库
    try {
      setIsSaving(true);
      await fetch(`/api/intake-history/${targetDate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIntake),
      });
    } catch (err) {
      console.error('保存失败:', err);
    } finally {
      setIsSaving(false);
    }
  }, [intake, targetDate]);

  // 保存控糖打卡
  const saveDietRestriction = useCallback(async (field: 'noFruit' | 'noSugar' | 'noWhiteFlour', value: boolean) => {
    try {
      setIsSaving(true);
      await fetch(`/api/intake-history/${targetDate}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (err) {
      console.error('保存失败:', err);
    } finally {
      setIsSaving(false);
    }
  }, [targetDate]);

  // 计算营养数据
  const { targets, totals, completionCount } = useMemo(() => {
    if (!userData) {
      return {
        targets: { carbs: 0, protein: 0, fat: 0, calories: 0 },
        totals: { carbs: 0, protein: 0, fat: 0, calories: 0 },
        completionCount: 0,
      };
    }

    const targets = calculateTargets(userData, carbDayType);
    
    // 简化的营养计算（这里应该使用完整的计算逻辑）
    const totals = {
      carbs: 0,
      protein: 0,
      fat: 0,
      calories: 0,
    };

    const completionCount = [
      intake.breakfastCompleted,
      intake.lunchCompleted,
      intake.snackCompleted,
      intake.dinnerCompleted,
      intake.strengthCompleted,
      intake.cardioCompleted,
    ].filter(Boolean).length;

    return { targets, totals, completionCount };
  }, [userData, carbDayType, intake]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--color-body)]">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <Header showBack title="补充历史记录" />

      <PageContainer className="pt-16 pb-8">
        {/* 日期和提示卡片 */}
        <Card className="mb-4 !p-4 bg-[#FFF9E6] border-[#F5C542]">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📅</span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-[var(--color-title)] mb-1">
                {formattedDate.long}
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant={carbDayBadgeVariant[carbDayType]}>
                  {getCarbDayTypeName(carbDayType)}
                </Badge>
                <span className="text-sm text-[var(--color-body)]">
                  补充打卡 {completionCount}/6
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 营养概览 */}
        <Card className="mb-4">
          <h3 className="text-base font-semibold text-[var(--color-title)] mb-4">
            营养目标
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <ProgressRing
              value={totals.carbs}
              max={targets.carbs}
              color="carb"
              size="sm"
              label="碳水"
              unit="g"
            />
            <ProgressRing
              value={totals.protein}
              max={targets.protein}
              color="protein"
              size="sm"
              label="蛋白质"
              unit="g"
            />
            <ProgressRing
              value={totals.fat}
              max={targets.fat}
              color="fat"
              size="sm"
              label="脂肪"
              unit="g"
            />
            <ProgressRing
              value={totals.calories}
              max={targets.calories}
              color="calories"
              size="sm"
              label="热量"
              unit="kcal"
            />
          </div>
        </Card>

        {/* 任务列表 */}
        <div className="space-y-3">
          {/* 早餐 */}
          <Card
            className="!p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/meals/breakfast?date=${targetDate}`)}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌅</span>
                <div>
                  <h4 className="font-medium text-[var(--color-title)]">早餐</h4>
                  <p className="text-xs text-[var(--color-body)]">燕麦 · 鸡蛋</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {intake.breakfastCompleted ? (
                  <Badge variant="low">✓ 已完成</Badge>
                ) : (
                  <span className="text-sm text-[var(--color-placeholder)]">未完成</span>
                )}
                <span className="text-[var(--color-placeholder)]">→</span>
              </div>
            </div>
          </Card>

          {/* 午餐 */}
          <Card
            className="!p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/meals/lunch?date=${targetDate}`)}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">☀️</span>
                <div>
                  <h4 className="font-medium text-[var(--color-title)]">午餐</h4>
                  <p className="text-xs text-[var(--color-body)]">米饭 · 肉类</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {intake.lunchCompleted ? (
                  <Badge variant="low">✓ 已完成</Badge>
                ) : (
                  <span className="text-sm text-[var(--color-placeholder)]">未完成</span>
                )}
                <span className="text-[var(--color-placeholder)]">→</span>
              </div>
            </div>
          </Card>

          {/* 加餐 */}
          <Card
            className="!p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/meals/snack?date=${targetDate}`)}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🍵</span>
                <div>
                  <h4 className="font-medium text-[var(--color-title)]">加餐</h4>
                  <p className="text-xs text-[var(--color-body)]">米饭 · 蛋白粉</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {intake.snackCompleted ? (
                  <Badge variant="low">✓ 已完成</Badge>
                ) : (
                  <span className="text-sm text-[var(--color-placeholder)]">未完成</span>
                )}
                <span className="text-[var(--color-placeholder)]">→</span>
              </div>
            </div>
          </Card>

          {/* 晚餐 */}
          <Card
            className="!p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/meals/dinner?date=${targetDate}`)}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌙</span>
                <div>
                  <h4 className="font-medium text-[var(--color-title)]">晚餐</h4>
                  <p className="text-xs text-[var(--color-body)]">米饭 · 肉类</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {intake.dinnerCompleted ? (
                  <Badge variant="low">✓ 已完成</Badge>
                ) : (
                  <span className="text-sm text-[var(--color-placeholder)]">未完成</span>
                )}
                <span className="text-[var(--color-placeholder)]">→</span>
              </div>
            </div>
          </Card>

          {/* 力量训练 */}
          <Card
            className="!p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/exercise/strength?date=${targetDate}`)}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏋️</span>
                <div>
                  <h4 className="font-medium text-[var(--color-title)]">力量训练</h4>
                  <p className="text-xs text-[var(--color-body)]">
                    {intake.strengthMinutes > 0 ? `${intake.strengthMinutes}分钟` : '建议 40-50 min'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {intake.strengthCompleted ? (
                  <Badge variant="low">✓ 已完成</Badge>
                ) : (
                  <span className="text-sm text-[var(--color-placeholder)]">未完成</span>
                )}
                <span className="text-[var(--color-placeholder)]">→</span>
              </div>
            </div>
          </Card>

          {/* 有氧训练 */}
          <Card
            className="!p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/exercise/cardio?date=${targetDate}`)}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏃</span>
                <div>
                  <h4 className="font-medium text-[var(--color-title)]">有氧训练</h4>
                  <p className="text-xs text-[var(--color-body)]">
                    {intake.cardioMinutes > 0 ? `${intake.cardioMinutes}分钟` : '建议 20-30 min'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {intake.cardioCompleted ? (
                  <Badge variant="low">✓ 已完成</Badge>
                ) : (
                  <span className="text-sm text-[var(--color-placeholder)]">未完成</span>
                )}
                <span className="text-[var(--color-placeholder)]">→</span>
              </div>
            </div>
          </Card>
        </div>

        {/* 控糖打卡 */}
        <Card className="mt-6">
          <h3 className="text-base font-semibold text-[var(--color-title)] mb-4 flex items-center gap-2">
            <span>🎯</span> 控糖打卡
          </h3>
          <div className="space-y-3">
            {/* 没有吃水果 */}
            <div 
              className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg cursor-pointer hover:bg-[var(--color-hover)] transition-colors"
              onClick={() => {
                const newValue = !noFruit;
                setNoFruit(newValue);
                saveDietRestriction('noFruit', newValue);
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍎</span>
                <span className="text-sm text-[var(--color-body)]">没有吃水果</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                noFruit 
                  ? 'border-[#27AE60] bg-[#27AE60]' 
                  : 'border-[var(--color-placeholder)]'
              }`}>
                {noFruit && <span className="text-white text-sm">✓</span>}
              </div>
            </div>

            {/* 没有吃糖 */}
            <div 
              className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg cursor-pointer hover:bg-[var(--color-hover)] transition-colors"
              onClick={() => {
                const newValue = !noSugar;
                setNoSugar(newValue);
                saveDietRestriction('noSugar', newValue);
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍬</span>
                <span className="text-sm text-[var(--color-body)]">没有吃糖</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                noSugar 
                  ? 'border-[#27AE60] bg-[#27AE60]' 
                  : 'border-[var(--color-placeholder)]'
              }`}>
                {noSugar && <span className="text-white text-sm">✓</span>}
              </div>
            </div>

            {/* 没有吃白面 */}
            <div 
              className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg cursor-pointer hover:bg-[var(--color-hover)] transition-colors"
              onClick={() => {
                const newValue = !noWhiteFlour;
                setNoWhiteFlour(newValue);
                saveDietRestriction('noWhiteFlour', newValue);
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🍞</span>
                <span className="text-sm text-[var(--color-body)]">没有吃白面</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                noWhiteFlour 
                  ? 'border-[#27AE60] bg-[#27AE60]' 
                  : 'border-[var(--color-placeholder)]'
              }`}>
                {noWhiteFlour && <span className="text-white text-sm">✓</span>}
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-placeholder)] mt-3">
            前1-1.5月：不吃水果、不吃白面。早餐燕麦，其余米饭。
          </p>
        </Card>

        {/* 保存提示 */}
        {isSaving && (
          <div className="mt-4 text-center text-sm text-[var(--color-primary)]">
            正在保存...
          </div>
        )}

        {/* 返回按钮 */}
        <Button
          variant="secondary"
          onClick={() => router.push('/plan')}
          className="w-full mt-6"
        >
          返回日历
        </Button>
      </PageContainer>
    </>
  );
}
