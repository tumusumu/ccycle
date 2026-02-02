'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IBodyMetricsInput } from '@/types/user';

export interface IMetricInputFormProps {
  onSubmit: (data: IBodyMetricsInput) => void;
  initialWeight?: number;
  initialBodyFat?: number;
  isLoading?: boolean;
  className?: string;
}

export function MetricInputForm({
  onSubmit,
  initialWeight,
  initialBodyFat,
  isLoading = false,
  className = '',
}: IMetricInputFormProps) {
  const [weight, setWeight] = useState<number>(initialWeight ?? 0);
  const [bodyFat, setBodyFat] = useState<number>(
    initialBodyFat ? initialBodyFat * 100 : 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      weight,
      bodyFatPercentage: bodyFat > 0 ? bodyFat / 100 : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
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
    </form>
  );
}
