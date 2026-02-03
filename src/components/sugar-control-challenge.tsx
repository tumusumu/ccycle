'use client';

import { useState, useEffect, useCallback } from 'react';

interface ISugarControlData {
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

const checkItems: { key: CheckKey; icon: string; label: string }[] = [
  { key: 'noFruit', icon: '🍎', label: '没有吃水果' },
  { key: 'noSugar', icon: '🍬', label: '没有吃糖' },
  { key: 'noWhiteFlour', icon: '🍞', label: '没有吃白面' },
];

const getMotivation = (day: number, allChecked: boolean): string => {
  if (allChecked) {
    if (day === 1) return '完美开局！继续保持！';
    if (day === 7) return '太棒了！完成第一周！';
    if (day === 14) return '坚持半个月了，你很强！';
    if (day === 21) return '三周了！胜利在望！';
    if (day >= 30) return '🎉 恭喜完成30天挑战！';
    return `太棒了！还有 ${30 - day} 天！`;
  }
  return `加油打卡！还有 ${30 - day} 天！`;
};

export function SugarControlChallenge() {
  const [data, setData] = useState<ISugarControlData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [savingItems, setSavingItems] = useState<Set<CheckKey>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/diet-restrictions');
      if (!res.ok) {
        setData(null);
        return;
      }
      const result = await res.json();
      if (result.ok) {
        setData(result);
      } else {
        setData(null);
      }
    } catch {
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

    setSavingItems((prev) => new Set(prev).add(key));
    setData((prev) =>
      prev ? { ...prev, today: { ...prev.today, [key]: true } } : null
    );

    try {
      const res = await fetch('/api/diet-restrictions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: true }),
      });

      if (res.ok) {
        await fetchData();
      } else {
        setData((prev) =>
          prev ? { ...prev, today: { ...prev.today, [key]: false } } : null
        );
      }
    } catch {
      setData((prev) =>
        prev ? { ...prev, today: { ...prev.today, [key]: false } } : null
      );
    } finally {
      setSavingItems((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // Don't render if loading, no data, or not in first month
  if (isLoading || !data || !data.isFirstMonth) {
    return null;
  }

  const { noFruit, noSugar, noWhiteFlour } = data.today;
  const checkedCount = [noFruit, noSugar, noWhiteFlour].filter(Boolean).length;
  const allChecked = checkedCount === 3;
  const progressPercent = Math.round((data.currentDay / 30) * 100);

  // Collapsed view (one line)
  if (!expanded) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setExpanded(true)}
          className="w-full bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] rounded-xl p-3
                     flex items-center justify-between hover:from-[#FDE68A] hover:to-[#FCD34D]
                     transition-all active:scale-[0.99] border border-[#F59E0B]/20"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="text-sm font-medium text-[#92400E]">
              控糖 {data.currentDay}/30天
            </span>
            {data.streakDays > 0 && (
              <span className="text-sm text-[#B45309]">
                🔥{data.streakDays}天
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base tracking-tight">
              <span className={noFruit ? 'opacity-100' : 'opacity-40'}>🍎</span>
              {noFruit && <span className="text-xs text-[#16A34A]">✓</span>}
              <span className={noSugar ? 'opacity-100' : 'opacity-40'}>🍬</span>
              {noSugar && <span className="text-xs text-[#16A34A]">✓</span>}
              <span className={noWhiteFlour ? 'opacity-100' : 'opacity-40'}>🍞</span>
              {noWhiteFlour && <span className="text-xs text-[#16A34A]">✓</span>}
            </span>
            <span className="text-xs text-[#4A90D9]">详情 ▼</span>
          </div>
        </button>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="mb-4 bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#FEF3C7] rounded-xl overflow-hidden border border-[#F59E0B]/30">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#F59E0B]/20">
        <h3 className="font-semibold text-[#92400E] flex items-center gap-2">
          <span>🎯</span>
          第一个月控糖挑战
        </h3>
        <button
          onClick={() => setExpanded(false)}
          className="text-sm text-[#4A90D9] hover:text-[#2563EB]"
        >
          收起 ▲
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-4 bg-white/50">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#78716C]">挑战进度</span>
            <span className="font-medium text-[#92400E]">
              {data.currentDay}/30 天
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#F59E0B] to-[#EAB308] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Check items */}
        <div className="space-y-2">
          <p className="text-xs text-[#78716C]">今日打卡状态：</p>

          {checkItems.map((item) => {
            const isChecked = data.today[item.key];
            const isSaving = savingItems.has(item.key);

            return (
              <div
                key={item.key}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${
                  isChecked
                    ? 'bg-[#ECFDF5] border border-[#10B981]/30'
                    : 'bg-white border border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.icon}</span>
                  <span
                    className={`text-sm ${
                      isChecked
                        ? 'text-[#059669] font-medium'
                        : 'text-[#374151]'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {isChecked ? (
                  <span className="text-[#10B981] text-sm font-medium flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    已确认
                  </span>
                ) : (
                  <button
                    onClick={() => handleCheck(item.key)}
                    disabled={isSaving}
                    className="px-3 py-1 text-xs font-medium rounded-md transition-all
                             bg-[#FBBF24] text-white hover:bg-[#F59E0B] active:scale-95
                             disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? '...' : '打卡'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex justify-between pt-2 border-t border-[#F59E0B]/20 text-sm">
          <span className="text-[#78716C]">
            🔥 连续遵守：
            <strong className="text-[#B45309]">{data.streakDays}</strong> 天
          </span>
          <span className="text-[#78716C]">
            📊 今日：
            <strong className="text-[#B45309]">{checkedCount}/3</strong>
          </span>
        </div>

        {/* Motivation */}
        <p className="text-sm text-center text-[#92400E] py-1 bg-[#FEF3C7]/50 rounded-lg">
          💪 {getMotivation(data.currentDay, allChecked)}
        </p>
      </div>
    </div>
  );
}
