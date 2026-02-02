'use client';

import { Card } from '@/components/ui/card';

export interface IMacroSummaryProps {
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  className?: string;
}

export function MacroSummary({
  carbs,
  protein,
  fat,
  calories,
  className = '',
}: IMacroSummaryProps) {
  return (
    <Card className={className}>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">{carbs}</div>
          <div className="text-xs text-gray-500">碳水(g)</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{protein}</div>
          <div className="text-xs text-gray-500">蛋白(g)</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-600">{fat}</div>
          <div className="text-xs text-gray-500">脂肪(g)</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">{calories}</div>
          <div className="text-xs text-gray-500">热量</div>
        </div>
      </div>
    </Card>
  );
}
