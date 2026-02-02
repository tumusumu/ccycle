'use client';

import { IFoodRestrictions, RESTRICTED_FOODS_CN } from '@/types/nutrition';
import { Card } from '@/components/ui/card';

export interface IRestrictionWarningProps {
  restrictions: IFoodRestrictions;
  className?: string;
}

export function RestrictionWarning({
  restrictions,
  className = '',
}: IRestrictionWarningProps) {
  const restrictedItems: string[] = [];

  if (restrictions.noFruit) {
    restrictedItems.push(RESTRICTED_FOODS_CN.FRUIT);
  }
  if (restrictions.noWhiteSugar) {
    restrictedItems.push(RESTRICTED_FOODS_CN.WHITE_SUGAR);
  }
  if (restrictions.noWhiteFlour) {
    restrictedItems.push(RESTRICTED_FOODS_CN.WHITE_FLOUR);
  }
  if (restrictions.noEggYolk) {
    restrictedItems.push(RESTRICTED_FOODS_CN.EGG_YOLK);
  }
  if (restrictions.noOil) {
    restrictedItems.push(RESTRICTED_FOODS_CN.OIL);
  }

  if (restrictedItems.length === 0) {
    return null;
  }

  return (
    <Card variant="warning" className={className}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚠️</div>
        <div>
          <div className="font-semibold text-[#E74C3C]">今日禁止食物</div>
          <div className="mt-1 text-sm text-[#E74C3C]">
            {restrictedItems.join('、')}
          </div>
        </div>
      </div>
    </Card>
  );
}
