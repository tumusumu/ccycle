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
import { formatDate, formatDateFromDb, getToday, getTodayString, addDays, getDaysBetween, parseDate } from '@/utils/date';
import { TCarbDayType } from '@/types/plan';
import { useIntake, IMealIntake } from '@/context/intake-context';
import {
  calculateTargets,
  calculateDailyNutrition,
  intakeToMealsData,
  IUserData,
} from '@/lib/nutrition-calculator';
import { SugarControlChallenge } from '@/components/sugar-control-challenge';

interface DailyPlan {
  date: string;
  dayNumber: number;
  carbDayType: TCarbDayType;
  intakeRecord?: {
    actualOatmealGrams?: number;
    actualWholeEggs?: number;
    actualWhiteOnlyEggs?: number;
    actualLunchRiceGrams?: number;
    actualLunchMeatType?: string;
    actualLunchMeatGrams?: number;
    actualLunchOliveOilMl?: number;
    actualSnackRiceGrams?: number;
    actualSnackProteinType?: string;
    actualSnackProteinGrams?: number;
    actualDinnerRiceGrams?: number;
    actualDinnerMeatType?: string;
    actualDinnerMeatGrams?: number;
    actualDinnerOliveOilMl?: number;
    actualStrengthMinutes?: number;
    actualCardioMinutes?: number;
    oatmealCompleted?: boolean;
    riceLunchCompleted?: boolean;
    riceDinnerCompleted?: boolean;
    protein1Completed?: boolean;
    protein2Completed?: boolean;
    protein3Completed?: boolean;
    protein4Completed?: boolean;
    noFruitConfirmed?: boolean;
    noSugarConfirmed?: boolean;
    noWhiteFlourConfirmed?: boolean;
  };
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

// Calculate completion count from DailyIntakeRecord (from database)
function getCompletionCountFromRecord(record: any): number {
  if (!record) return 0;
  
  // Check completion flags in database
  const breakfastCompleted = record.oatmealCompleted && record.protein1Completed;
  const lunchCompleted = record.riceLunchCompleted && record.protein2Completed;
  const snackCompleted = record.protein3Completed;
  const dinnerCompleted = record.riceDinnerCompleted && record.protein4Completed;
  
  // Check exercise completion (need to check actualXXXMinutes > 0)
  const strengthCompleted = (record.actualStrengthMinutes ?? 0) > 0;
  const cardioCompleted = (record.actualCardioMinutes ?? 0) > 0;
  
  return [
    breakfastCompleted,
    lunchCompleted,
    snackCompleted,
    dinnerCompleted,
    strengthCompleted,
    cardioCompleted,
  ].filter(Boolean).length;
}

// Calculate completion count from intake data (for today, from context)
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

  // Today's date (UTC midnight for DB comparison)
  const today = useMemo(() => getToday(), []);
  const todayStr = getTodayString();

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

      if (!planRes.ok) throw new Error('Failed to fetch plan');

      const planData = await planRes.json();

      // 检查是否没有活跃计划
      if (planData.ok === false && planData.code === 'NO_PLAN') {
        router.push('/onboarding');
        return;
      }

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

    // plan.startDate 是 UTC 午夜的 Date
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
      // 使用 addDays 保持 UTC 午夜
      const date = addDays(cycleStart, i);
      const dateStr = formatDateFromDb(date);

      // 使用 getDaysBetween 计算天数差
      const daysSinceStart = getDaysBetween(planStart, date);
      const dayNumber = daysSinceStart + 1;
      const dayInCycle = i + 1;

      // Get carb type based on position in cycle
      const carbDayType = getCarbTypeForDate(planStart, date);

      // Get completion data - for today use context, for other days use database
      let completionCount = 0;
      if (dateStr === todayStr) {
        completionCount = todayCompleted;
      } else {
        // Find the dailyMealPlan for this date from the plan data
        const dailyMealPlan = plan.dailyMealPlans?.find((mp: any) => {
          // mp.date might be a string or Date object, normalize it
          const mpDateStr = typeof mp.date === 'string' 
            ? mp.date.split('T')[0] 
            : formatDateFromDb(new Date(mp.date));
          return mpDateStr === dateStr;
        });
        if (dailyMealPlan?.intakeRecord) {
          completionCount = getCompletionCountFromRecord(dailyMealPlan.intakeRecord);
        }
      }
      const completionPercent = Math.round((completionCount / 6) * 100);

      // Determine status - compare date strings to avoid timezone issues
      let status: DayStatus = 'future';
      const daysDiff = getDaysBetween(today, date);
      if (dateStr === todayStr) {
        status = 'today';
      } else if (daysDiff < 0) {
        // Past day - check if there's any data
        if (completionCount === 0) {
          status = 'no-data'; // No records for this day
        } else {
          status = 'completed';
        }
      }

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
    const totalDays = getDaysBetween(planStart, today) + 1;
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

    // Get intake data - for today use context, for other days use database
    let storedIntake: IMealIntake | null = null;
    if (dayData.status === 'today') {
      storedIntake = intake;
    } else {
      // Find the dailyMealPlan for this date from the plan data
      const dailyMealPlan = plan?.dailyMealPlans?.find((mp: any) => {
        const mpDateStr = typeof mp.date === 'string' 
          ? mp.date.split('T')[0] 
          : formatDateFromDb(new Date(mp.date));
        return mpDateStr === dayData.dateStr;
      });

      // Convert intakeRecord to IMealIntake format if exists
      if (dailyMealPlan?.intakeRecord) {
        const record = dailyMealPlan.intakeRecord;
        storedIntake = {
          oatmealGrams: record.actualOatmealGrams ?? 0,
          wholeEggs: record.actualWholeEggs ?? 0,
          whiteOnlyEggs: record.actualWhiteOnlyEggs ?? 0,
          breakfastCompleted: (record.oatmealCompleted ?? false) && (record.protein1Completed ?? false),
          lunchRiceGrams: record.actualLunchRiceGrams ?? 0,
          lunchMeatType: record.actualLunchMeatType ?? '',
          lunchMeatGrams: record.actualLunchMeatGrams ?? 0,
          lunchOliveOilMl: record.actualLunchOliveOilMl ?? 0,
          lunchCompleted: (record.riceLunchCompleted ?? false) && (record.protein2Completed ?? false),
          snackRiceGrams: record.actualSnackRiceGrams ?? 0,
          snackMeatType: record.actualSnackProteinType ?? '',
          snackMeatGrams: record.actualSnackProteinGrams ?? 0,
          snackCompleted: record.protein3Completed ?? false,
          dinnerRiceGrams: record.actualDinnerRiceGrams ?? 0,
          dinnerMeatType: record.actualDinnerMeatType ?? '',
          dinnerMeatGrams: record.actualDinnerMeatGrams ?? 0,
          dinnerOliveOilMl: record.actualDinnerOliveOilMl ?? 0,
          dinnerCompleted: (record.riceDinnerCompleted ?? false) && (record.protein4Completed ?? false),
          strengthMinutes: record.actualStrengthMinutes ?? 0,
          strengthCompleted: (record.actualStrengthMinutes ?? 0) > 0,
          cardioMinutes: record.actualCardioMinutes ?? 0,
          cardioCompleted: (record.actualCardioMinutes ?? 0) > 0,
        };
      }
    }

    // Calculate actual nutrition
    let nutrition = { carbs: 0, protein: 0, fat: 0, calories: 0 };
    if (storedIntake) {
      // Convert IMealIntake to IDailyMealsData format
      const mealsData = {
        breakfast: {
          oatmealGrams: storedIntake.oatmealGrams,
          wholeEggs: storedIntake.wholeEggs,
          whiteOnlyEggs: storedIntake.whiteOnlyEggs,
        },
        lunch: {
          riceGrams: storedIntake.lunchRiceGrams,
          meatType: storedIntake.lunchMeatType,
          meatGrams: storedIntake.lunchMeatGrams,
          oliveOilMl: storedIntake.lunchOliveOilMl,
        },
        snack: {
          riceGrams: storedIntake.snackRiceGrams,
          meatType: storedIntake.snackMeatType,
          meatGrams: storedIntake.snackMeatGrams,
        },
        dinner: {
          riceGrams: storedIntake.dinnerRiceGrams,
          meatType: storedIntake.dinnerMeatType,
          meatGrams: storedIntake.dinnerMeatGrams,
          oliveOilMl: storedIntake.dinnerOliveOilMl,
        },
      };
      nutrition = calculateDailyNutrition(mealsData);
    }

    // Get diet restrictions from database record
    let dietRestrictions = undefined;
    if (dayData.status !== 'today') {
      const dailyMealPlan = plan?.dailyMealPlans?.find((mp: any) => {
        const mpDateStr = typeof mp.date === 'string' 
          ? mp.date.split('T')[0] 
          : formatDateFromDb(new Date(mp.date));
        return mpDateStr === dayData.dateStr;
      });
      if (dailyMealPlan?.intakeRecord) {
        const record = dailyMealPlan.intakeRecord;
        dietRestrictions = {
          noFruit: record.noFruitConfirmed ?? false,
          noSugar: record.noSugarConfirmed ?? false,
          noWhiteFlour: record.noWhiteFlourConfirmed ?? false,
        };
      }
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
      dietRestrictions,
      hasNoData: dayData.status === 'no-data', // 标记是否需要补充录入
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
      <Header showBack title="我的计划" showLogout />

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

        {/* Sugar Control Challenge - 第一个月控糖挑战 */}
        <SugarControlChallenge />

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
