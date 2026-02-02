'use client';

import { TCarbDayType } from '@/types/plan';

export type DayStatus = 'completed' | 'today' | 'future';

export interface IDayCellProps {
  date: Date;
  dayNumber: number;
  carbDayType: TCarbDayType;
  status: DayStatus;
  isOnTarget?: boolean;
  completionPercent?: number;
  onClick?: () => void;
}

const carbTypeColors: Record<TCarbDayType, {
  bgActive: string;
  bgInactive: string;
  text: string;
  textMuted: string;
  label: string;
}> = {
  LOW: {
    bgActive: 'bg-[#A8D5BA]',
    bgInactive: 'bg-[#E8F5E9]',
    text: 'text-[#2E7D32]',
    textMuted: 'text-[#66BB6A]',
    label: '低碳',
  },
  MEDIUM: {
    bgActive: 'bg-[#FFE082]',
    bgInactive: 'bg-[#FFF8E1]',
    text: 'text-[#F57C00]',
    textMuted: 'text-[#FFB74D]',
    label: '中碳',
  },
  HIGH: {
    bgActive: 'bg-[#FFCDD2]',
    bgInactive: 'bg-[#FFEBEE]',
    text: 'text-[#C62828]',
    textMuted: 'text-[#EF5350]',
    label: '高碳',
  },
};

export function DayCell({
  date,
  carbDayType,
  status,
  isOnTarget = true,
  completionPercent = 0,
  onClick,
}: IDayCellProps) {
  const carbStyle = carbTypeColors[carbDayType];
  const dateNum = date.getDate();

  // Base styles
  let containerClass = 'flex flex-col items-center justify-between p-1.5 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 min-w-[44px] h-[68px]';
  let iconContent: React.ReactNode = null;
  let statusText: React.ReactNode = null;

  if (status === 'completed') {
    if (isOnTarget) {
      // Completed + On target
      containerClass += ' bg-gradient-to-b from-[#5CB85C] to-[#4A9D4A] text-white';
      iconContent = <span className="text-sm">✓</span>;
      statusText = <span className="text-[10px] font-medium">达标</span>;
    } else {
      // Completed + Over target
      containerClass += ' bg-[#F5C542] text-white';
      iconContent = <span className="text-sm">⚠</span>;
      statusText = <span className="text-[10px] font-medium">超标</span>;
    }
  } else if (status === 'today') {
    // Today - in progress
    containerClass += ` ${carbStyle.bgActive} border-2 border-[#4A90D9]`;
    iconContent = <span className="text-[10px] font-medium text-[#4A90D9]">进行中</span>;
    statusText = <span className="text-[10px] text-[#4A90D9]">{completionPercent}%</span>;
  } else {
    // Future - show carb type color (lighter shade)
    containerClass += ` ${carbStyle.bgInactive} ${carbStyle.textMuted}`;
    iconContent = <span className="text-sm opacity-40">·</span>;
    statusText = <span className="text-[10px] opacity-0">·</span>;
  }

  return (
    <div className={containerClass} onClick={onClick}>
      {/* Top: Status icon/text */}
      <div className="flex flex-col items-center">
        {iconContent}
        {statusText}
      </div>

      {/* Bottom: Carb type label */}
      <div
        className={`text-[9px] px-1.5 py-0.5 rounded-full ${
          status === 'completed'
            ? 'bg-white/20 text-white'
            : status === 'today'
              ? `bg-white/60 ${carbStyle.text}`
              : `bg-white/60 ${carbStyle.text} opacity-70`
        }`}
      >
        {carbStyle.label}
      </div>
    </div>
  );
}
