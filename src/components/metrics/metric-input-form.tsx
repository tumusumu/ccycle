'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IBodyMetricsInput } from '@/types/user';

export interface IMetricInputFormProps {
  onSubmit: (data: IBodyMetricsInput) => void;
  initialWeight?: number;
  initialBodyFat?: number;
  initialMuscleMass?: number;
  initialWaistCircumference?: number;
  showAdvanced?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function MetricInputForm({
  onSubmit,
  initialWeight,
  initialBodyFat,
  initialMuscleMass,
  initialWaistCircumference,
  showAdvanced: initialShowAdvanced = false,
  isLoading = false,
  className = '',
}: IMetricInputFormProps) {
  const [weight, setWeight] = useState<number>(initialWeight ?? 0);
  const [bodyFat, setBodyFat] = useState<number>(
    initialBodyFat ? initialBodyFat * 100 : 0
  );
  const [muscleMass, setMuscleMass] = useState<number>(initialMuscleMass ?? 0);
  const [waistCircumference, setWaistCircumference] = useState<number>(
    initialWaistCircumference ?? 0
  );
  const [note, setNote] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(initialShowAdvanced);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      weight,
      bodyFatPercentage: bodyFat > 0 ? bodyFat / 100 : undefined,
      muscleMass: muscleMass > 0 ? muscleMass : undefined,
      waistCircumference: waistCircumference > 0 ? waistCircumference : undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
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

        {/* Advanced fields toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-[#4A90D9] hover:underline flex items-center gap-1"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          更多指标
        </button>

        {/* Advanced fields */}
        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t border-[#EEF2F7]">
            <Input
              label="肌肉量 (kg) - 可选"
              type="number"
              value={muscleMass || ''}
              onChange={(v) => setMuscleMass(Number(v))}
              min={10}
              max={100}
              step={0.1}
            />

            <Input
              label="腰围 (cm) - 可选"
              type="number"
              value={waistCircumference || ''}
              onChange={(v) => setWaistCircumference(Number(v))}
              min={40}
              max={200}
              step={0.1}
            />

            <div>
              <label className="block text-sm font-medium text-[#2C3E50] mb-1">
                备注 - 可选
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="今日状态、饮食、运动等..."
                className="w-full px-3 py-2 text-sm border border-[#AEB6BF] rounded-[12px]
                         focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent
                         placeholder:text-[#AEB6BF] resize-none"
                rows={2}
              />
            </div>
          </div>
        )}

        <Button type="submit" loading={isLoading} className="w-full">
          保存记录
        </Button>
      </div>
    </form>
  );
}
