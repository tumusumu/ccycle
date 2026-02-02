'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DayCell, DayDetailModal, IDayDetailData, DayStatus, CycleStats } from '@/components/plan';
import {
  getCarbDayTypeName,
  getCycleNumber,
  getDayInCycle,
  getCarbTypeForDate,
  getCycleStartDate,
  CYCLE_LENGTH,
} from '@/utils/carbon-cycle';
import { formatDate } from '@/utils/date';
import { TCarbDayType } from '@/types/plan';
import { useIntake, IMealIntake } from '@/context/intake-context';
import {
  calculateTargets,
  calculateDailyNutrition,
  intakeToMealsData,
  IUserData,
} from '@/lib/nutrition-calculator';

interface DailyPlan {
  date: string;
  dayNumber: number;
  carbDayType: TCarbDayType;
}

interface PlanData {
  id: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  currentDay: number;
  totalDaysElapsed: number;
  totalDays: number;
  dailyMealPlans: DailyPlan[];
}

interface UserData {
  weight: number;
  bodyFatPercentage: number;
}

// Get intake data from localStorage for a specific date
function getIntakeForDate(dateStr: string, visitorId: string): IMealIntake | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `intake-${visitorId}-${dateStr}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      // Try legacy key without userId
      const legacyStored = localStorage.getItem(`intake-${dateStr}`);
      if (legacyStored) return JSON.parse(legacyStored);
      return null;
    }
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// Calculate completion count from intake data
function getCompletionCount(intake: IMealIntake | null): number {
  if (!intake) return 0;
  return [
    intake.breakfastCompleted,
    intake.lunchCompleted,
    intake.snackCompleted,
    intake.dinnerCompleted,
    intake.strengthCompleted,
    intake.cardioCompleted,
  ].filter(Boolean).length;
}

export default function PlanPage() {
  const router = useRouter();
  const { intake } = useIntake();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<IDayDetailData | null>(null);
  const [currentCycleNumber, setCurrentCycleNumber] = useState<number>(1);

  // Today's date
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const todayStr = formatDate(today);

  // Today's completion
  const todayCompleted = useMemo(() => {
    return [
      intake.breakfastCompleted,
      intake.lunchCompleted,
      intake.snackCompleted,
      intake.dinnerCompleted,
      intake.strengthCompleted,
      intake.cardioCompleted,
    ].filter(Boolean).length;
  }, [intake]);

  const fetchData = useCallback(async () => {
    try {
      const [planRes, userRes] = await Promise.all([
        fetch('/api/plan/current'),
        fetch('/api/user'),
      ]);

      if (planRes.status === 404) {
        router.push('/onboarding');
        return;
      }
      if (!planRes.ok) throw new Error('Failed to fetch plan');

      const planData = await planRes.json();
      setPlan(planData);

      // Set initial cycle to current cycle
      const startDate = new Date(planData.startDate);
      const currentCycle = getCycleNumber(startDate, today);
      setCurrentCycleNumber(currentCycle);

      if (userRes.ok) {
        const user = await userRes.json();
        setUserData({
          weight: user.weight,
          bodyFatPercentage: user.bodyFatPercentage,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [router, today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate 6-day cycle data
  const cycleData = useMemo(() => {
    if (!plan) return [];

    const planStart = new Date(plan.startDate);
    const cycleStart = getCycleStartDate(planStart, currentCycleNumber);

    const result: Array<{
      date: Date;
      dateStr: string;
      dayNumber: number;
      dayInCycle: number;
      carbDayType: TCarbDayType;
      status: DayStatus;
      completionPercent: number;
      isOnTarget: boolean;
    }> = [];

    for (let i = 0; i < CYCLE_LENGTH; i++) {
      const date = new Date(cycleStart);
      date.setDate(cycleStart.getDate() + i);
      const dateStr = formatDate(date);

      // Calculate day number from plan start
      const daysSinceStart = Math.floor((date.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24));
      const dayNumber = daysSinceStart + 1;
      const dayInCycle = i + 1;

      // Get carb type based on position in cycle
      const carbDayType = getCarbTypeForDate(planStart, date);

      // Determine status
      let status: DayStatus = 'future';
      if (date < today) {
        status = 'completed';
      } else if (dateStr === todayStr) {
        status = 'today';
      }

      // Get completion data
      const storedIntake = status === 'today' ? intake : getIntakeForDate(dateStr, plan.id);
      const completionCount = status === 'today' ? todayCompleted : getCompletionCount(storedIntake);
      const completionPercent = Math.round((completionCount / 6) * 100);

      // Determine if on target (simplified: if completed 6/6)
      const isOnTarget = completionCount === 6;

      result.push({
        date,
        dateStr,
        dayNumber,
        dayInCycle,
        carbDayType,
        status,
        completionPercent,
        isOnTarget,
      });
    }

    return result;
  }, [plan, currentCycleNumber, today, todayStr, intake, todayCompleted]);

  // Calculate current info
  const currentInfo = useMemo(() => {
    if (!plan) return null;

    const planStart = new Date(plan.startDate);
    const totalDays = Math.floor((today.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const currentCycle = getCycleNumber(planStart, today);
    const dayInCycle = getDayInCycle(planStart, today);

    return {
      totalDays: Math.max(1, totalDays),
      currentCycle,
      dayInCycle,
    };
  }, [plan, today]);

  // Navigate cycles
  const goToPrevCycle = () => {
    if (currentCycleNumber > 1) {
      setCurrentCycleNumber(currentCycleNumber - 1);
    }
  };

  const goToNextCycle = () => {
    if (!plan || !currentInfo) return;
    // Allow viewing up to 2 cycles ahead
    const maxCycle = currentInfo.currentCycle + 2;
    if (currentCycleNumber < maxCycle) {
      setCurrentCycleNumber(currentCycleNumber + 1);
    }
  };

  // Handle day click
  const handleDayClick = (dayData: typeof cycleData[0]) => {
    if (dayData.status === 'future') return;
    if (!userData) return;

    // Calculate targets for this day
    const targets = calculateTargets(
      { weight: userData.weight, bodyFatPercentage: userData.bodyFatPercentage } as IUserData,
      dayData.carbDayType
    );

    // Get intake data
    const storedIntake = dayData.status === 'today' ? intake : getIntakeForDate(dayData.dateStr, plan?.id || '');

    // Calculate actual nutrition
    let nutrition = { carbs: 0, protein: 0, fat: 0, calories: 0 };
    if (storedIntake) {
      const mealsData = intakeToMealsData(storedIntake);
      nutrition = calculateDailyNutrition(mealsData);
    }

    setSelectedDay({
      date: dayData.date,
      carbDayType: dayData.carbDayType,
      nutrition: {
        carbs: { actual: Math.round(nutrition.carbs), target: targets.carbs },
        protein: { actual: Math.round(nutrition.protein), target: targets.protein },
        fat: { actual: Math.round(nutrition.fat), target: targets.fat },
        calories: { actual: Math.round(nutrition.calories), target: targets.calories },
      },
      exercise: storedIntake ? {
        strengthMinutes: storedIntake.strengthMinutes,
        cardioMinutes: storedIntake.cardioMinutes,
      } : undefined,
    });
  };

  const handleRestart = async () => {
    if (!confirm('确定要重新开始计划吗？当前计划将被取消。')) return;

    try {
      if (plan) {
        await fetch(`/api/plan/${plan.id}`, { method: 'DELETE' });
      }
      router.push('/onboarding');
    } catch (err) {
      console.error('Failed to restart:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
        <div className="text-[#5D6D7E]">加载中...</div>
      </div>
    );
  }

  if (!plan) return null;

  // Calculate stats for current cycle view
  const completedDays = cycleData.filter((d) => d.status === 'completed').length;
  const onTargetDays = cycleData.filter((d) => d.status === 'completed' && d.isOnTarget).length;

  // Find today in cycle data
  const todayInCycle = cycleData.find((d) => d.dateStr === todayStr);

  return (
    <>
      <Header showBack title="我的计划" />

      <PageContainer className="pt-16 pb-24">
        {/* Cycle Navigation */}
        <Card className="mb-4 !p-3">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPrevCycle}
              disabled={currentCycleNumber <= 1}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-[#5D6D7E] ${
                currentCycleNumber <= 1 ? 'opacity-30' : 'hover:bg-[#EEF2F7]'
              }`}
            >
              ◀
            </button>
            <div className="text-center">
              <div className="text-lg font-semibold text-[#2C3E50]">
                第{currentCycleNumber}周期 · 共6天
              </div>
              <div className="text-xs text-[#5D6D7E]">
                当前第{currentInfo?.totalDays}天 · 周期第{currentInfo?.dayInCycle}天
              </div>
            </div>
            <button
              onClick={goToNextCycle}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EEF2F7] text-[#5D6D7E]"
            >
              ▶
            </button>
          </div>
        </Card>

        {/* 6-Day Cycle Calendar */}
        <Card className="mb-4 !p-3">
          {/* Cycle position headers (1-6) */}
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {cycleData.map((day) => (
              <div
                key={`header-${day.dayInCycle}`}
                className="text-center text-xs text-[#AEB6BF]"
              >
                第{day.dayInCycle}天
              </div>
            ))}
          </div>

          {/* Date row */}
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {cycleData.map((day) => (
              <div
                key={`date-${day.dateStr}`}
                className={`text-center text-xs ${
                  day.dateStr === todayStr ? 'text-[#4A90D9] font-semibold' : 'text-[#5D6D7E]'
                }`}
              >
                {day.date.getMonth() + 1}/{day.date.getDate()}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-6 gap-1.5">
            {cycleData.map((day) => (
              <DayCell
                key={day.dateStr}
                date={day.date}
                dayNumber={day.dayNumber}
                carbDayType={day.carbDayType}
                status={day.status}
                isOnTarget={day.isOnTarget}
                completionPercent={day.completionPercent}
                onClick={() => handleDayClick(day)}
              />
            ))}
          </div>

          {/* Pattern indicator */}
          <div className="mt-3 pt-3 border-t border-[#EEF2F7]">
            <div className="text-center text-xs text-[#AEB6BF]">
              112113模式：低-低-中-低-低-高
            </div>
          </div>
        </Card>

        {/* Cycle Stats */}
        <div className="mb-4">
          <CycleStats
            cycleNumber={currentCycleNumber}
            totalDays={CYCLE_LENGTH}
            completedDays={completedDays}
            onTargetDays={onTargetDays}
          />
        </div>

        {/* Today's quick status */}
        {todayInCycle && (
          <Card className="mb-4 !p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[#2C3E50]">今日进度</h3>
                <p className="text-xs text-[#5D6D7E]">
                  {getCarbDayTypeName(todayInCycle.carbDayType)} · 周期第{todayInCycle.dayInCycle}天
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#4A90D9]">{todayCompleted}/6</div>
                <div className="text-xs text-[#5D6D7E]">
                  {Math.round((todayCompleted / 6) * 100)}%
                </div>
              </div>
            </div>
            <div className="mt-3 w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4A90D9] rounded-full transition-all duration-500"
                style={{ width: `${(todayCompleted / 6) * 100}%` }}
              />
            </div>
          </Card>
        )}

        {/* Restart Button */}
        <Button variant="secondary" onClick={handleRestart} className="w-full">
          重新开始计划
        </Button>
      </PageContainer>

      {/* Day Detail Modal */}
      <DayDetailModal
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        data={selectedDay}
      />

      <BottomNav />
    </>
  );
}
