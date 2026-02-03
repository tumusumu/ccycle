'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TCarbDayType } from '@/types/plan';
import { getCarbDayTypeName } from '@/utils/carbon-cycle';
import { Badge } from '@/components/ui/badge';
import { clearCurrentUser, useCurrentUser } from '@/hooks/use-current-user';

export interface IHeaderProps {
  currentCarbDay?: TCarbDayType;
  dayNumber?: number;
  showBack?: boolean;
  title?: string;
  backHref?: string;
  className?: string;
  showLogout?: boolean;
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
  showLogout = false,
}: IHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useCurrentUser();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      clearCurrentUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
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
            <Link href="/dashboard" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="CCycle Logo"
                width={40}
                height={40}
                className="rounded-lg"
                priority
              />
              <span className="text-lg font-semibold text-[#2C3E50]">
                {user?.username || ''}
              </span>
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
        <div className="flex items-center gap-2">
          {currentCarbDay && (
            <>
              {dayNumber && (
                <span className="text-sm text-[#5D6D7E]">第 {dayNumber} 天</span>
              )}
              <Badge variant={carbDayBadgeVariant[currentCarbDay]} size="md">
                {getCarbDayTypeName(currentCarbDay)}
              </Badge>
            </>
          )}

          {showLogout && (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="ml-2 p-1.5 text-[#5D6D7E] hover:text-[#E74C3C] hover:bg-red-50 rounded-lg transition-colors"
              title="退出登录"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Placeholder for layout balance when showBack is true */}
        {showBack && !currentCarbDay && !showLogout && (
          <div className="w-12" />
        )}
      </div>
    </header>
  );
}
