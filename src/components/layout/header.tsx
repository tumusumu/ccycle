'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TCarbDayType } from '@/types/plan';
import { getCarbDayTypeName } from '@/utils/carbon-cycle';
import { Badge } from '@/components/ui/badge';

export interface IHeaderProps {
  currentCarbDay?: TCarbDayType;
  dayNumber?: number;
  showBack?: boolean;
  title?: string;
  backHref?: string;
  className?: string;
}

const carbDayBadgeVariant: Record<TCarbDayType, 'low' | 'medium' | 'high'> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export function Header({
  currentCarbDay,
  dayNumber,
  showBack = false,
  title,
  backHref,
  className = '',
}: IHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-40
        bg-white
        px-4 py-3
        ${className}
      `}
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-[#4A90D9] hover:opacity-80 transition-opacity"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-sm">返回</span>
            </button>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#2C3E50]">CCycle</h1>
              <span className="text-sm text-[#AEB6BF]">碳循112</span>
            </Link>
          )}
        </div>

        {/* Center title (when showBack is true) */}
        {showBack && title && (
          <h2 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold text-[#2C3E50]">
            {title}
          </h2>
        )}

        {/* Right side */}
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

        {/* Placeholder for layout balance when showBack is true */}
        {showBack && !currentCarbDay && (
          <div className="w-12" />
        )}
      </div>
    </header>
  );
}
