'use client';

import { Checkbox } from '@/components/ui/checkbox';

export interface IFoodItemProps {
  name: string;
  amount: number;
  unit: 'g' | 'ml' | 'L';
  checked: boolean;
  onCheck: () => void;
  isRestricted?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FoodItem({
  name,
  amount,
  unit,
  checked,
  onCheck,
  isRestricted = false,
  disabled = false,
  className = '',
}: IFoodItemProps) {
  return (
    <div
      className={`
        flex items-center justify-between
        py-3 px-4
        border-b border-[#EEF2F7] last:border-b-0
        ${isRestricted ? 'bg-[#FEF2F2]' : ''}
        ${checked ? 'opacity-60' : ''}
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          label=""
          checked={checked}
          onChange={onCheck}
          disabled={disabled}
          size="lg"
        />
        <div>
          <span
            className={`
              font-medium
              ${isRestricted ? 'text-[#E74C3C]' : 'text-[#2C3E50]'}
              ${checked ? 'line-through' : ''}
            `}
          >
            {name}
          </span>
          {isRestricted && (
            <span className="ml-2 text-xs text-[#E74C3C]">(禁止)</span>
          )}
        </div>
      </div>
      <div className="text-[#5D6D7E] font-mono">
        {amount}
        {unit}
      </div>
    </div>
  );
}
