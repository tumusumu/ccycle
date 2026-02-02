'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface IWaterTrackerProps {
  target: number; // liters
  completed: boolean;
  onComplete: () => void;
  className?: string;
}

export function WaterTracker({
  target,
  completed,
  onComplete,
  className = '',
}: IWaterTrackerProps) {
  const targetMl = target * 1000;

  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">💧</div>
          <div>
            <div className="font-semibold text-[#2C3E50]">饮水目标</div>
            <div className="text-sm text-[#5D6D7E]">
              今日需喝 {target}L ({targetMl}ml)
            </div>
          </div>
        </div>
        <Button
          variant={completed ? 'secondary' : 'primary'}
          size="sm"
          onClick={onComplete}
        >
          {completed ? '已完成 ✓' : '完成'}
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: completed ? '100%' : '0%',
            backgroundColor: '#7EC8E3',
          }}
        />
      </div>
      <div className="mt-2 text-right text-sm text-[#5D6D7E]">
        {completed ? targetMl : 0} / {targetMl} ml
      </div>
    </Card>
  );
}
