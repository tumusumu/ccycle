'use client';

import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { IExercisePlan } from '@/types/exercise';

export interface IExerciseCardProps {
  plan: IExercisePlan;
  strengthCompleted: boolean;
  cardioSession1: boolean;
  cardioSession2: boolean;
  onStrengthChange: (checked: boolean) => void;
  onCardio1Change: (checked: boolean) => void;
  onCardio2Change: (checked: boolean) => void;
  className?: string;
}

export function ExerciseCard({
  plan,
  strengthCompleted,
  cardioSession1,
  cardioSession2,
  onStrengthChange,
  onCardio1Change,
  onCardio2Change,
  className = '',
}: IExerciseCardProps) {
  const cardioDisabled = plan.maxCardioSessions === 0;
  const cardio2Disabled = plan.maxCardioSessions < 2;

  return (
    <Card className={className}>
      <div className="space-y-4">
        {/* Strength training */}
        <div className="flex items-center justify-between py-3 border-b border-[#EEF2F7]">
          <div>
            <div className="font-medium text-[#2C3E50]">💪 力量训练</div>
            <div className="text-sm text-[#5D6D7E]">
              {plan.strengthTrainingRecommended ? '推荐进行' : '可选'}
            </div>
          </div>
          <Checkbox
            label=""
            checked={strengthCompleted}
            onChange={onStrengthChange}
            size="lg"
          />
        </div>

        {/* Cardio sessions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-[#2C3E50]">🏃 有氧训练 1</div>
              <div className="text-sm text-[#5D6D7E]">
                {cardioDisabled ? '今日不建议' : '可选'}
              </div>
            </div>
            <Checkbox
              label=""
              checked={cardioSession1}
              onChange={onCardio1Change}
              disabled={cardioDisabled}
              size="lg"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div
                className={`font-medium ${cardio2Disabled ? 'text-[#AEB6BF]' : 'text-[#2C3E50]'}`}
              >
                🏃 有氧训练 2
              </div>
              <div className="text-sm text-[#5D6D7E]">
                {cardio2Disabled ? '今日最多1次' : '可选'}
              </div>
            </div>
            <Checkbox
              label=""
              checked={cardioSession2}
              onChange={onCardio2Change}
              disabled={cardio2Disabled}
              size="lg"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="pt-4 border-t border-[#EEF2F7]">
          <div className="text-sm font-semibold text-[#2C3E50] mb-2">训练建议</div>
          <div className="text-sm text-[#5D6D7E]">{plan.cardioNotes}</div>
          <ul className="mt-2 text-sm text-[#5D6D7E] space-y-1">
            {plan.tips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
