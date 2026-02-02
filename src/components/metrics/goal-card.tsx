'use client';

import { IMetricGoal, TGoalType } from '@/types/user';
import { ProgressBar } from '@/components/ui/progress-bar';

export interface IGoalWithProgress extends IMetricGoal {
  currentValue: number | null;
  progress: number;
}

export interface IGoalCardProps {
  goal: IGoalWithProgress;
  onCancel?: (id: string) => void;
  onAchieve?: (id: string) => void;
  className?: string;
}

const goalTypeLabels: Record<TGoalType, string> = {
  WEIGHT: '体重目标',
  BODY_FAT: '体脂目标',
  MUSCLE_MASS: '肌肉量目标',
};

const goalTypeUnits: Record<TGoalType, string> = {
  WEIGHT: 'kg',
  BODY_FAT: '%',
  MUSCLE_MASS: 'kg',
};

const goalTypeColors: Record<TGoalType, 'blue' | 'green' | 'yellow' | 'red'> = {
  WEIGHT: 'blue',
  BODY_FAT: 'yellow',
  MUSCLE_MASS: 'green',
};

function formatValue(value: number, goalType: TGoalType): string {
  if (goalType === 'BODY_FAT') {
    return (value * 100).toFixed(1);
  }
  return value.toFixed(1);
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export function GoalCard({
  goal,
  onCancel,
  onAchieve,
  className = '',
}: IGoalCardProps) {
  const unit = goalTypeUnits[goal.goalType];
  const color = goalTypeColors[goal.goalType];
  const isDecreasing = goal.targetValue < goal.startValue;
  const directionLabel = isDecreasing ? '减少' : '增加';

  const startDisplay = formatValue(goal.startValue, goal.goalType);
  const targetDisplay = formatValue(goal.targetValue, goal.goalType);
  const currentDisplay = goal.currentValue !== null
    ? formatValue(goal.currentValue, goal.goalType)
    : '--';

  const totalChange = Math.abs(goal.targetValue - goal.startValue);
  const changeDisplay = formatValue(totalChange, goal.goalType);

  return (
    <div
      className={`bg-white rounded-[16px] p-4 ${className}`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#2C3E50]">
            {goalTypeLabels[goal.goalType]}
          </span>
          {goal.status === 'ACHIEVED' && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-[#5CB85C] rounded-full">
              已达成
            </span>
          )}
          {goal.status === 'CANCELLED' && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-[#AEB6BF] rounded-full">
              已取消
            </span>
          )}
        </div>
        {goal.status === 'ACTIVE' && (
          <div className="flex gap-2">
            {onAchieve && goal.progress >= 100 && (
              <button
                onClick={() => onAchieve(goal.id)}
                className="text-xs text-[#5CB85C] hover:underline"
              >
                标记完成
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => onCancel(goal.id)}
                className="text-xs text-[#E74C3C] hover:underline"
              >
                取消
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-sm text-[#5D6D7E]">
            {directionLabel} {changeDisplay}{unit}
          </span>
          <span className="text-sm font-medium text-[#2C3E50]">
            {goal.progress}%
          </span>
        </div>
        <ProgressBar value={goal.progress} color={color} size="md" />
      </div>

      {/* Values */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-[#AEB6BF]">起始</div>
          <div className="text-sm font-medium text-[#5D6D7E]">
            {startDisplay}{unit}
          </div>
        </div>
        <div>
          <div className="text-xs text-[#AEB6BF]">当前</div>
          <div className="text-sm font-bold text-[#2C3E50]">
            {currentDisplay}{unit}
          </div>
        </div>
        <div>
          <div className="text-xs text-[#AEB6BF]">目标</div>
          <div className="text-sm font-medium" style={{ color: `var(--color-${color}, #4A90D9)` }}>
            {targetDisplay}{unit}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="mt-3 pt-3 border-t border-[#EEF2F7] flex justify-between text-xs text-[#AEB6BF]">
        <span>开始: {formatDate(goal.startDate)}</span>
        {goal.targetDate && (
          <span>目标日期: {formatDate(goal.targetDate)}</span>
        )}
        {goal.achievedAt && (
          <span className="text-[#5CB85C]">达成: {formatDate(goal.achievedAt)}</span>
        )}
      </div>
    </div>
  );
}
