'use client';

import { TCarbDayType } from '@/types/plan';
import { getCarbDayTypeName } from '@/utils/carbon-cycle';

export interface ICarbDayIndicatorProps {
  carbDayType: TCarbDayType;
  dayNumber: number;
  className?: string;
}

const carbDayStyles: Record<TCarbDayType, string> = {
  LOW: 'bg-green-500 text-white',
  MEDIUM: 'bg-yellow-500 text-white',
  HIGH: 'bg-red-500 text-white',
};

const carbDayDescriptions: Record<TCarbDayType, string> = {
  LOW: '低碳日 - 控制碳水摄入,促进脂肪燃烧',
  MEDIUM: '中碳日 - 适度碳水,维持能量平衡',
  HIGH: '高碳日 - 补充糖原,提升训练表现',
};

export function CarbDayIndicator({
  carbDayType,
  dayNumber,
  className = '',
}: ICarbDayIndicatorProps) {
  return (
    <div className={`text-center ${className}`}>
      <div
        className={`
          inline-flex items-center justify-center
          w-24 h-24 rounded-full
          text-3xl font-bold
          ${carbDayStyles[carbDayType]}
        `}
      >
        {getCarbDayTypeName(carbDayType).slice(0, 1)}
      </div>
      <div className="mt-3">
        <div className="text-xl font-semibold text-gray-900">
          {getCarbDayTypeName(carbDayType)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          第 {dayNumber} 天
        </div>
        <div className="text-xs text-gray-400 mt-2 max-w-xs mx-auto">
          {carbDayDescriptions[carbDayType]}
        </div>
      </div>
    </div>
  );
}
