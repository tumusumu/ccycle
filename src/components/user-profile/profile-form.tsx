'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IUserProfileInput, TGender } from '@/types/user';

export interface IProfileFormProps {
  onSubmit: (data: IUserProfileInput) => void;
  initialData?: Partial<IUserProfileInput>;
  isLoading?: boolean;
  className?: string;
}

const genderOptions = [
  { value: 'MALE', label: '男性' },
  { value: 'FEMALE', label: '女性' },
];

export function ProfileForm({
  onSubmit,
  initialData,
  isLoading = false,
  className = '',
}: IProfileFormProps) {
  const [gender, setGender] = useState<TGender>(
    initialData?.gender ?? 'MALE'
  );
  const [weight, setWeight] = useState<number>(initialData?.weight ?? 70);
  const [bodyFat, setBodyFat] = useState<number>(
    initialData?.bodyFatPercentage
      ? initialData.bodyFatPercentage * 100
      : 25
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      gender,
      weight,
      bodyFatPercentage: bodyFat / 100,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <Select
        label="性别"
        options={genderOptions}
        value={gender}
        onChange={(v) => setGender(v as TGender)}
      />

      <Input
        label="体重 (kg)"
        type="number"
        value={weight}
        onChange={(v) => setWeight(Number(v))}
        min={30}
        max={300}
        step={0.1}
      />

      <Input
        label="体脂率 (%)"
        type="number"
        value={bodyFat}
        onChange={(v) => setBodyFat(Number(v))}
        min={5}
        max={50}
        step={0.1}
      />

      <Button type="submit" loading={isLoading} className="w-full mt-4">
        保存
      </Button>
    </form>
  );
}
