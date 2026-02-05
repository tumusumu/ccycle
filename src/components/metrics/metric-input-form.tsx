'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IBodyMetricsInput } from '@/types/user';

export interface IMetricInputFormProps {
  onSubmit: (data: IBodyMetricsInput) => void;
  initialWeight?: number;
  initialBodyFat?: number;
  initialDate?: Date;
  showDatePicker?: boolean;
  isLoading?: boolean;
  className?: string;
}

// Format date to YYYY-MM-DD for input[type="date"]
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function MetricInputForm({
  onSubmit,
  initialWeight,
  initialBodyFat,
  initialDate,
  showDatePicker = false,
  isLoading = false,
  className = '',
}: IMetricInputFormProps) {
  const [weight, setWeight] = useState<number>(initialWeight ?? 0);
  // Handle both decimal (0.20) and percentage (20) formats
  const [bodyFat, setBodyFat] = useState<number>(() => {
    if (!initialBodyFat) return 0;
    // If value > 1, it's already a percentage (e.g., 20 for 20%)
    // If value <= 1, it's a decimal (e.g., 0.20 for 20%)
    let value: number;
    if (initialBodyFat > 1) {
      value = Math.round(initialBodyFat * 100) / 100;
    } else {
      value = Math.round(initialBodyFat * 10000) / 100;
    }
    // Cap at reasonable range (5-50%)
    return Math.min(50, Math.max(0, value));
  });
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateForInput(initialDate ?? new Date())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 始终传本地日历日 YYYY-MM-DD，避免 Date 序列化为 UTC 导致错日
    const dateStr =
      showDatePicker && selectedDate
        ? selectedDate
        : formatDateForInput(new Date());

    onSubmit({
      weight,
      // Convert percentage (20) to decimal (0.20) for API
      bodyFatPercentage: bodyFat > 0 ? bodyFat / 100 : undefined,
      date: dateStr,
    });
  };

  // Get max date (today)
  const maxDate = formatDateForInput(new Date());

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {/* Date picker (optional) */}
        {showDatePicker && (
          <div>
            <label className="block text-sm font-medium text-[#2C3E50] mb-1">
              记录日期
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={maxDate}
              className="w-full px-3 py-2 text-sm border border-[#AEB6BF] rounded-[12px]
                       focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent"
            />
          </div>
        )}

        {/* Primary fields */}
        <Input
          label="体重 (kg)"
          type="number"
          value={weight || ''}
          onChange={(v) => setWeight(Number(v))}
          min={30}
          max={300}
          step={0.1}
        />

        <Input
          label="体脂率 (%) - 可选"
          type="number"
          value={bodyFat || ''}
          onChange={(v) => setBodyFat(Number(v))}
          min={5}
          max={50}
          step={0.1}
        />

        <Button type="submit" loading={isLoading} className="w-full">
          保存记录
        </Button>
      </div>
    </form>
  );
}
