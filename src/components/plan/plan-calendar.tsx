'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TCarbDayType } from '@/types/plan';

interface DayPlan {
  date: string;
  dayNumber: number;
  carbDayType: TCarbDayType;
}

interface PlanCalendarProps {
  startDate: string;
  dailyPlans: DayPlan[];
  className?: string;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const carbDayColors: Record<TCarbDayType, string> = {
  LOW: '#A8D5BA',
  MEDIUM: '#F5C542',
  HIGH: '#E74C3C',
};

const carbDayLabels: Record<TCarbDayType, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
};

function formatDateKey(date: Date): string {
  // 使用本地日期方法，避免 toISOString() 的时区转换问题
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthName(year: number, month: number): string {
  return `${year}年${month + 1}月`;
}

export function PlanCalendar({ startDate, dailyPlans, className = '' }: PlanCalendarProps) {
  // Build a map of date -> plan for quick lookup
  const planMap = useMemo(() => {
    const map = new Map<string, DayPlan>();
    dailyPlans.forEach((plan) => {
      const dateKey = plan.date.split('T')[0];
      map.set(dateKey, plan);
    });
    return map;
  }, [dailyPlans]);

  // Calculate the range of months to display
  const { startMonth, endMonth } = useMemo(() => {
    const start = new Date(startDate);
    const lastPlan = dailyPlans[dailyPlans.length - 1];
    const end = lastPlan ? new Date(lastPlan.date) : start;
    return {
      startMonth: { year: start.getFullYear(), month: start.getMonth() },
      endMonth: { year: end.getFullYear(), month: end.getMonth() },
    };
  }, [startDate, dailyPlans]);

  const [currentMonth, setCurrentMonth] = useState(startMonth);

  const today = useMemo(() => formatDateKey(new Date()), []);
  const planStartDate = useMemo(() => startDate.split('T')[0], [startDate]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of week for the first day (0 = Sunday, adjust to Monday = 0)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: Array<{
      date: string;
      dayOfMonth: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isBeforePlanStart: boolean;
      plan: DayPlan | null;
    }> = [];

    // Add empty slots for days before the first of month
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startDayOfWeek + i + 1);
      const dateKey = formatDateKey(prevDate);
      days.push({
        date: dateKey,
        dayOfMonth: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: dateKey === today,
        isBeforePlanStart: dateKey < planStartDate,
        plan: planMap.get(dateKey) || null,
      });
    }

    // Add days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateKey = formatDateKey(date);
      days.push({
        date: dateKey,
        dayOfMonth: d,
        isCurrentMonth: true,
        isToday: dateKey === today,
        isBeforePlanStart: dateKey < planStartDate,
        plan: planMap.get(dateKey) || null,
      });
    }

    // Add days from next month to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(year, month + 1, i);
        const dateKey = formatDateKey(nextDate);
        days.push({
          date: dateKey,
          dayOfMonth: i,
          isCurrentMonth: false,
          isToday: dateKey === today,
          isBeforePlanStart: dateKey < planStartDate,
          plan: planMap.get(dateKey) || null,
        });
      }
    }

    return days;
  }, [currentMonth, planMap, today, planStartDate]);

  const canGoPrev = useMemo(() => {
    return (
      currentMonth.year > startMonth.year ||
      (currentMonth.year === startMonth.year && currentMonth.month > startMonth.month)
    );
  }, [currentMonth, startMonth]);

  const canGoNext = useMemo(() => {
    return (
      currentMonth.year < endMonth.year ||
      (currentMonth.year === endMonth.year && currentMonth.month < endMonth.month)
    );
  }, [currentMonth, endMonth]);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    setCurrentMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    setCurrentMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  return (
    <Card className={className}>
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            canGoPrev
              ? 'text-[#4A90D9] hover:bg-[#EEF2F7]'
              : 'text-[#CCCCCC] cursor-not-allowed'
          }`}
        >
          ←
        </button>
        <h3 className="text-lg font-semibold text-[#2C3E50]">
          {getMonthName(currentMonth.year, currentMonth.month)}
        </h3>
        <button
          onClick={handleNextMonth}
          disabled={!canGoNext}
          className={`w-8 h-8 flex items-center justify-center rounded-full ${
            canGoNext
              ? 'text-[#4A90D9] hover:bg-[#EEF2F7]'
              : 'text-[#CCCCCC] cursor-not-allowed'
          }`}
        >
          →
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-[#5D6D7E] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              relative aspect-square rounded-lg flex flex-col items-center justify-center p-1
              ${day.isCurrentMonth ? '' : 'opacity-40'}
              ${day.isToday ? 'ring-2 ring-[#4A90D9] ring-offset-1' : ''}
              ${day.isBeforePlanStart && !day.plan ? 'bg-gray-100' : ''}
              ${day.plan ? '' : 'bg-white'}
            `}
            style={
              day.plan
                ? { backgroundColor: carbDayColors[day.plan.carbDayType] }
                : undefined
            }
          >
            <span
              className={`text-sm font-medium ${
                day.plan ? 'text-white' : day.isBeforePlanStart ? 'text-gray-400' : 'text-[#2C3E50]'
              }`}
            >
              {day.dayOfMonth}
            </span>
            {day.plan && (
              <span className="text-xs text-white font-medium">
                {carbDayLabels[day.plan.carbDayType]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-[#EEF2F7]">
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: carbDayColors.LOW }}
          />
          <span className="text-xs text-[#5D6D7E]">低碳日</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: carbDayColors.MEDIUM }}
          />
          <span className="text-xs text-[#5D6D7E]">中碳日</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: carbDayColors.HIGH }}
          />
          <span className="text-xs text-[#5D6D7E]">高碳日</span>
        </div>
      </div>
    </Card>
  );
}
