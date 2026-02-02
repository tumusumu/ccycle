'use client';

import { TCarbDayType } from '@/types/plan';
import { getCarbDayTypeName } from '@/utils/carbon-cycle';
import { Badge } from '@/components/ui/badge';

export interface IHeaderProps {
  currentCarbDay?: TCarbDayType;
  dayNumber?: number;
  className?: string;
}

const carbDayBadgeVariant: Record<TCarbDayType, 'low' | 'medium' | 'high'> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export function Header({ currentCarbDay, dayNumber, className = '' }: IHeaderProps) {
  return (
    <header
      className={`
        sticky top-0 z-40
        bg-white
        px-4 py-3
        ${className}
      `}
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#2C3E50]">CCycle</h1>
          <span className="text-sm text-[#AEB6BF]">碳循112</span>
        </div>

        {currentCarbDay && (
          <div className="flex items-center gap-2">
            {dayNumber && (
              <span className="text-sm text-[#5D6D7E]">第 {dayNumber} 天</span>
            )}
            <Badge variant={carbDayBadgeVariant[currentCarbDay]} size="md">
              {getCarbDayTypeName(currentCarbDay)}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}
