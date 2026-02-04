'use client';

import { useRouter } from 'next/navigation';
import { TCarbDayType } from '@/types/plan';
import { getCarbDayTypeName } from '@/utils/carbon-cycle';
import { NutritionStatusIcon, getNutritionStatus } from '@/components/ui/nutrition-status-icon';
import { formatDateFromDb } from '@/utils/date';
import { Button } from '@/components/ui/button';

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
  dietRestrictions?: {
    noFruit: boolean;
    noSugar: boolean;
    noWhiteFlour: boolean;
  };
  hasNoData?: boolean; // 是否没有数据（需要补充录入）
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
  const router = useRouter();

  if (!isOpen || !data) return null;

  const weekday = data.date.toLocaleDateString('zh-CN', { weekday: 'short' });
  const dateStr = data.date.toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
  });

  // 跳转到历史记录补充页面
  const handleNavigateToHistory = () => {
    const targetDateStr = formatDateFromDb(data.date);
    router.push(`/history/${targetDateStr}`);
  };

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
          {data.hasNoData ? (
            /* No Data State - 补充录入提示 */
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#FFF4E5] rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#F5C542]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[#2C3E50] mb-2">
                这一天还没有记录
              </h3>
              <p className="text-sm text-[#5D6D7E] mb-6">
                点击下方按钮补充当天的饮食和运动记录
              </p>
              <Button onClick={handleNavigateToHistory} className="w-full">
                📝 补充录入打卡
              </Button>
              <p className="text-xs text-[#AEB6BF] mt-3 text-center">
                可以补充该日的所有餐食和运动记录
              </p>
            </div>
          ) : (
            <>
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
                <div className="mb-6">
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

              {/* Diet Restrictions Section (第一个月饮食禁忌) */}
              {data.dietRestrictions && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-[#2C3E50] mb-2 flex items-center gap-2">
                    <span>🎯</span> 控糖打卡
                  </h4>
                  <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#5D6D7E]">🍎 没有吃水果</span>
                      <span className={`font-medium ${data.dietRestrictions.noFruit ? 'text-[#27AE60]' : 'text-[#95A5A6]'}`}>
                        {data.dietRestrictions.noFruit ? '✓ 已确认' : '未确认'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#5D6D7E]">🍬 没有吃糖</span>
                      <span className={`font-medium ${data.dietRestrictions.noSugar ? 'text-[#27AE60]' : 'text-[#95A5A6]'}`}>
                        {data.dietRestrictions.noSugar ? '✓ 已确认' : '未确认'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#5D6D7E]">🍞 没有吃白面</span>
                      <span className={`font-medium ${data.dietRestrictions.noWhiteFlour ? 'text-[#27AE60]' : 'text-[#95A5A6]'}`}>
                        {data.dietRestrictions.noWhiteFlour ? '✓ 已确认' : '未确认'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Button - 编辑/补打卡按钮 */}
              <div className="mt-6 pt-4 border-t border-[#EEF2F7]">
                <Button 
                  onClick={handleNavigateToHistory} 
                  className="w-full"
                  variant="primary"
                >
                  ✏️ 编辑修改数据
                </Button>
                <p className="text-xs text-[#AEB6BF] mt-3 text-center">
                  可以修改餐食记录、运动数据和控糖打卡
                </p>
              </div>
            </>
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
