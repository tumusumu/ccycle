'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';

interface IDietRestrictionData {
  currentDay: number;
  remainingDays: number;
  today: {
    noFruit: boolean;
    noSugar: boolean;
    noWhiteFlour: boolean;
  };
  streakDays: number;
  isFirstMonth: boolean;
}

type CheckKey = 'noFruit' | 'noSugar' | 'noWhiteFlour';

interface ICheckItem {
  key: CheckKey;
  icon: string;
  label: string;
}

const checkItems: ICheckItem[] = [
  { key: 'noFruit', icon: '🍎', label: '没有吃水果' },
  { key: 'noSugar', icon: '🍬', label: '没有吃糖' },
  { key: 'noWhiteFlour', icon: '🍞', label: '没有吃白面' },
];

export function DietRestrictionCard() {
  const [data, setData] = useState<IDietRestrictionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savingItems, setSavingItems] = useState<Set<CheckKey>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      setError(false);
      const res = await fetch('/api/diet-restrictions');

      if (!res.ok) {
        // 401/404 are expected when not logged in or no plan
        if (res.status === 401 || res.status === 404) {
          setData(null);
          return;
        }
        throw new Error('Failed to fetch');
      }

      const result = await res.json();
      if (result.ok) {
        setData(result);
      } else {
        setData(null);
      }
    } catch {
      setError(true);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheck = async (key: CheckKey) => {
    if (!data || data.today[key] || savingItems.has(key)) return;

    // Optimistically update UI
    setSavingItems(prev => new Set(prev).add(key));
    setData(prev => prev ? {
      ...prev,
      today: { ...prev.today, [key]: true }
    } : null);

    try {
      const res = await fetch('/api/diet-restrictions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: true }),
      });

      if (res.ok) {
        // Refresh to get updated streak count
        await fetchData();
      } else {
        // Revert on failure
        setData(prev => prev ? {
          ...prev,
          today: { ...prev.today, [key]: false }
        } : null);
      }
    } catch {
      // Revert on error
      setData(prev => prev ? {
        ...prev,
        today: { ...prev.today, [key]: false }
      } : null);
    } finally {
      setSavingItems(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // Don't render if loading, error, no data, or not in first month
  if (isLoading || error || !data || !data.isFirstMonth) {
    return null;
  }

  const checkedCount = [data.today.noFruit, data.today.noSugar, data.today.noWhiteFlour].filter(Boolean).length;
  const allChecked = checkedCount === 3;

  return (
    <Card className="mt-3 !p-0 overflow-hidden border-[#FBBF24]/40">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] px-4 py-3 border-b border-[#FBBF24]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="text-sm font-semibold text-[#92400E]">
              第一个月饮食禁忌
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#B45309] bg-white/60 px-2 py-0.5 rounded-full">
              还剩 {data.remainingDays} 天
            </span>
          </div>
        </div>
      </div>

      {/* Check items */}
      <div className="px-4 py-3 bg-white">
        <p className="text-xs text-[#6B7280] mb-3">今日自律打卡：</p>

        <div className="space-y-2">
          {checkItems.map((item) => {
            const isChecked = data.today[item.key];
            const isSaving = savingItems.has(item.key);

            return (
              <div
                key={item.key}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isChecked
                    ? 'bg-[#ECFDF5] border border-[#10B981]/30'
                    : 'bg-[#F9FAFB] border border-transparent hover:border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{item.icon}</span>
                  <span className={`text-sm ${isChecked ? 'text-[#059669] font-medium' : 'text-[#374151]'}`}>
                    {item.label}
                  </span>
                </div>

                {isChecked ? (
                  <div className="flex items-center gap-1.5 text-[#10B981]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">已打卡</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheck(item.key)}
                    disabled={isSaving}
                    className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all
                             bg-[#FBBF24] text-white hover:bg-[#F59E0B] active:scale-95
                             disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </span>
                    ) : '打卡'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with streak */}
      <div className="px-4 py-3 bg-[#FEFCE8] border-t border-[#FEF08A]">
        {allChecked ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">🎉</span>
            <span className="text-sm text-[#854D0E]">
              今日完成！连续遵守 <strong className="text-[#B45309]">{data.streakDays}</strong> 天
            </span>
            <span className="text-lg">🔥</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">💪</span>
              <span className="text-sm text-[#78716C]">
                已打卡 {checkedCount}/3 项
              </span>
            </div>
            {data.streakDays > 0 && (
              <span className="text-xs text-[#92400E]">
                连续 {data.streakDays} 天 🔥
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
