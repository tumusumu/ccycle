'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type TNavTab = 'dashboard' | 'plan' | 'stats';

export interface IBottomNavProps {
  className?: string;
}

interface NavItem {
  key: TNavTab;
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: '今日',
    href: '/dashboard',
    icon: (active) => (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: active ? '#4A90D9' : '#AEB6BF' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    key: 'plan',
    label: '日历',
    href: '/plan',
    icon: (active) => (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: active ? '#4A90D9' : '#AEB6BF' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    key: 'stats',
    label: '我的',
    href: '/stats',
    icon: (active) => (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: active ? '#4A90D9' : '#AEB6BF' }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export function BottomNav({ className = '' }: IBottomNavProps) {
  const pathname = usePathname();

  const getActiveTab = (): TNavTab | null => {
    // Check exact matches first
    if (pathname === '/dashboard' || pathname.startsWith('/meals/') || pathname.startsWith('/exercise/')) {
      return 'dashboard';
    }
    if (pathname.startsWith('/plan')) {
      return 'plan';
    }
    if (pathname.startsWith('/stats')) {
      return 'stats';
    }
    return null;
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-40
        bg-white
        safe-area-bottom
        ${className}
      `}
      style={{
        boxShadow: '0 -1px 3px rgba(0,0,0,0.05)',
        borderTop: '1px solid #EEF2F7',
      }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[60px] min-h-[48px] flex-1 transition-colors duration-200"
            >
              {item.icon(isActive)}
              <span
                className="text-xs font-medium"
                style={{ color: isActive ? '#4A90D9' : '#AEB6BF' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}