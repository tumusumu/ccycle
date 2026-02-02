'use client';

import { TCarbDayType } from '@/types/plan';
import { getCarbDayTypeName } from '@/utils/carbon-cycle';
import { NutritionStatusIcon, getNutritionStatus } from '@/components/ui/nutrition-status-icon';

export interface INutritionData {
  actual: number;
  target: number;
}

export interface IDayDetailData {
  date: Date;
  carbDayType: TCarbDayType;
  nutrition: {
    carbs: INutritionData;
    protein: INutritionData;
    fat: INutritionData;
    calories: INutritionData;
  };
  exercise?: {
    strengthMinutes?: number;
    cardioMinutes?: number;
  };
}

interface IDayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: IDayDetailData | null;
}

function NutritionRow({
  label,
  actual,
  target,
  unit = 'g',
}: {
  label: string;
  actual: number;
  target: number;
  unit?: string;
}) {
  const percent = target > 0 ? Math.round((actual / target) * 100) : 0;
  const status = getNutritionStatus(actual, target);
  const isOver = status === 'exceeded';

  return (
    <div className="flex items-center gap-3 py-2">
      <NutritionStatusIcon status={status} size={18} />
      <span className="text-sm text-[#5D6D7E] w-14">{label}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={isOver ? 'text-[#FF6B6B] font-medium' : 'text-[#2C3E50]'}>
            {actual}/{target}{unit}
          </span>
          <span className={isOver ? 'text-[#FF6B6B]' : 'text-[#5D6D7E]'}>
            {percent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOver ? 'bg-[#FF6B6B]' : status === 'achieved' ? 'bg-[#5CB85C]' : 'bg-[#4A90D9]'
            }`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function DayDetailModal({ isOpen, onClose, data }: IDayDetailModalProps) {
  if (!isOpen || !data) return null;

  const weekday = data.date.toLocaleDateString('zh-CN', { weekday: 'short' });
  const dateStr = data.date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 bottom-4 z-50 bg-white rounded-2xl shadow-xl max-h-[70vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white px-4 py-3 border-b border-[#EEF2F7] flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-[#2C3E50]">
              {dateStr} {weekday}
            </span>
            <span className="ml-2 text-sm text-[#5D6D7E]">
              - {getCarbDayTypeName(data.carbDayType)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EEF2F7] text-[#5D6D7E]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Nutrition Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#2C3E50] mb-2 flex items-center gap-2">
              <span>📊</span> 营养摄入
            </h4>
            <div className="bg-[#F8F9FA] rounded-xl p-3">
              <NutritionRow
                label="碳水"
                actual={data.nutrition.carbs.actual}
                target={data.nutrition.carbs.target}
              />
              <NutritionRow
                label="蛋白质"
                actual={data.nutrition.protein.actual}
                target={data.nutrition.protein.target}
              />
              <NutritionRow
                label="脂肪"
                actual={data.nutrition.fat.actual}
                target={data.nutrition.fat.target}
              />
              <NutritionRow
                label="热量"
                actual={data.nutrition.calories.actual}
                target={data.nutrition.calories.target}
                unit="kcal"
              />
            </div>
          </div>

          {/* Exercise Section */}
          {data.exercise && (data.exercise.strengthMinutes || data.exercise.cardioMinutes) && (
            <div>
              <h4 className="text-sm font-medium text-[#2C3E50] mb-2 flex items-center gap-2">
                <span>💪</span> 运动记录
              </h4>
              <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-2">
                {data.exercise.strengthMinutes && data.exercise.strengthMinutes > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5D6D7E]">力量训练</span>
                    <span className="text-[#2C3E50] font-medium">
                      {data.exercise.strengthMinutes} 分钟
                    </span>
                  </div>
                )}
                {data.exercise.cardioMinutes && data.exercise.cardioMinutes > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5D6D7E]">有氧训练</span>
                    <span className="text-[#2C3E50] font-medium">
                      {data.exercise.cardioMinutes} 分钟
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
