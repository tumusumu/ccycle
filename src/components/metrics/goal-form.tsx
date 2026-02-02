'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TGoalType, IMetricGoalInput } from '@/types/user';

export interface IGoalFormProps {
  onSubmit: (data: IMetricGoalInput) => void;
  currentWeight?: number;
  currentBodyFat?: number;
  isLoading?: boolean;
  className?: string;
}

const goalTypeOptions = [
  { value: 'WEIGHT', label: '体重目标' },
  { value: 'BODY_FAT', label: '体脂率目标' },
];

export function GoalForm({
  onSubmit,
  currentWeight,
  currentBodyFat,
  isLoading = false,
  className = '',
}: IGoalFormProps) {
  const [goalType, setGoalType] = useState<TGoalType>('WEIGHT');
  const [targetValue, setTargetValue] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');

  // Get current value based on goal type
  const getCurrentValue = (): number | undefined => {
    switch (goalType) {
      case 'WEIGHT':
        return currentWeight;
      case 'BODY_FAT':
        return currentBodyFat;
      default:
        return undefined;
    }
  };

  const currentValue = getCurrentValue();

  const getDisplayValue = (value: number | undefined): string => {
    if (value === undefined) return '--';
    if (goalType === 'BODY_FAT') {
      return (value * 100).toFixed(1) + '%';
    }
    return value.toFixed(1) + 'kg';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetValue || currentValue === undefined) return;

    let target = parseFloat(targetValue);
    const start = currentValue;

    // Convert body fat percentage from display (25%) to decimal (0.25)
    if (goalType === 'BODY_FAT') {
      target = target / 100;
    }

    onSubmit({
      goalType,
      targetValue: target,
      startValue: start,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    });
  };

  const getPlaceholder = (): string => {
    switch (goalType) {
      case 'WEIGHT':
        return '目标体重 (kg)';
      case 'BODY_FAT':
        return '目标体脂率 (%)';
      default:
        return '目标值';
    }
  };

  const getMinMax = (): { min: number; max: number; step: number } => {
    switch (goalType) {
      case 'WEIGHT':
        return { min: 40, max: 150, step: 0.1 };
      case 'BODY_FAT':
        return { min: 5, max: 45, step: 0.1 };
      default:
        return { min: 0, max: 100, step: 0.1 };
    }
  };

  const { min, max, step } = getMinMax();
  const isValid = targetValue && currentValue !== undefined && parseFloat(targetValue) !== (goalType === 'BODY_FAT' ? currentValue * 100 : currentValue);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {/* Goal Type */}
        <Select
          label="目标类型"
          value={goalType}
          onChange={(v) => {
            setGoalType(v as TGoalType);
            setTargetValue('');
          }}
          options={goalTypeOptions}
        />

        {/* Current Value Display */}
        <div className="bg-[#EEF2F7] rounded-[12px] p-3">
          <div className="text-xs text-[#5D6D7E] mb-1">当前数值</div>
          <div className="text-lg font-semibold text-[#2C3E50]">
            {getDisplayValue(currentValue)}
          </div>
          {currentValue === undefined && (
            <div className="text-xs text-[#E74C3C] mt-1">
              请先记录此指标的数据
            </div>
          )}
        </div>

        {/* Target Value */}
        <Input
          label={getPlaceholder()}
          type="number"
          value={targetValue}
          onChange={(v) => setTargetValue(String(v))}
          min={min}
          max={max}
          step={step}
          disabled={currentValue === undefined}
        />

        {/* Target Date (optional) */}
        <Input
          label="目标日期 (可选)"
          type="date"
          value={targetDate}
          onChange={(v) => setTargetDate(String(v))}
          min={new Date().toISOString().split('T')[0]}
        />

        {/* Preview */}
        {isValid && currentValue !== undefined && (
          <div className="bg-[#F0FDF4] rounded-[12px] p-3 text-sm">
            <span className="text-[#5D6D7E]">目标: </span>
            <span className="font-medium text-[#2C3E50]">
              {goalType === 'BODY_FAT'
                ? `${(currentValue * 100).toFixed(1)}% → ${targetValue}%`
                : `${currentValue.toFixed(1)}kg → ${targetValue}kg`
              }
            </span>
            <span className="text-[#5CB85C] ml-2">
              ({parseFloat(targetValue) < (goalType === 'BODY_FAT' ? currentValue * 100 : currentValue) ? '减少' : '增加'}
              {Math.abs(parseFloat(targetValue) - (goalType === 'BODY_FAT' ? currentValue * 100 : currentValue)).toFixed(1)}
              {goalType === 'BODY_FAT' ? '%' : 'kg'})
            </span>
          </div>
        )}

        <Button
          type="submit"
          loading={isLoading}
          disabled={!isValid}
          className="w-full"
        >
          创建目标
        </Button>
      </div>
    </form>
  );
}
