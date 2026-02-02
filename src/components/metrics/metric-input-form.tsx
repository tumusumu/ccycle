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
  const [bodyFat, setBodyFat] = useState<number>(
    initialBodyFat ? Math.round(initialBodyFat * 10000) / 100 : 0
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateForInput(initialDate ?? new Date())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse date string to local Date object
    let parsedDate: Date | undefined;
    if (showDatePicker && selectedDate) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      parsedDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    onSubmit({
      weight,
      bodyFatPercentage: bodyFat > 0 ? bodyFat / 100 : undefined,
      date: parsedDate,
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
