'use client';

import { IBMIResult } from '@/types/user';
import { getBMICategoryColor } from '@/utils/bmi';

export interface IBMIDisplayProps {
  bmi: IBMIResult | null;
  showScale?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: {
    value: 'text-xl',
    label: 'text-xs',
    scale: 'h-2',
  },
  md: {
    value: 'text-2xl',
    label: 'text-sm',
    scale: 'h-3',
  },
  lg: {
    value: 'text-3xl',
    label: 'text-base',
    scale: 'h-4',
  },
};

// BMI scale ranges for the visual indicator
const BMI_RANGES = [
  { min: 0, max: 18.5, label: '偏瘦', color: '#7EC8E3' },
  { min: 18.5, max: 24, label: '正常', color: '#5CB85C' },
  { min: 24, max: 28, label: '偏胖', color: '#F5C542' },
  { min: 28, max: 40, label: '肥胖', color: '#E74C3C' },
];

export function BMIDisplay({
  bmi,
  showScale = true,
  size = 'md',
  className = '',
}: IBMIDisplayProps) {
  const styles = sizeStyles[size];

  if (!bmi) {
    return (
      <div className={`text-center ${className}`}>
        <div className={`font-bold text-[#AEB6BF] ${styles.value}`}>--</div>
        <div className={`text-[#5D6D7E] ${styles.label}`}>BMI</div>
        <div className={`text-[#AEB6BF] ${styles.label} mt-1`}>
          请设置身高
        </div>
      </div>
    );
  }

  const color = getBMICategoryColor(bmi.category);

  // Calculate marker position on the scale (15-35 range for display)
  const scaleMin = 15;
  const scaleMax = 35;
  const markerPosition = Math.min(
    100,
    Math.max(0, ((bmi.value - scaleMin) / (scaleMax - scaleMin)) * 100)
  );

  return (
    <div className={`text-center ${className}`}>
      <div className={`font-bold ${styles.value}`} style={{ color }}>
        {bmi.value}
      </div>
      <div className={`text-[#5D6D7E] ${styles.label}`}>BMI</div>
      <div className={`font-medium ${styles.label} mt-1`} style={{ color }}>
        {bmi.categoryLabel}
      </div>

      {showScale && (
        <div className="mt-3">
          {/* Scale bar */}
          <div className={`relative w-full rounded-full overflow-hidden ${styles.scale}`}>
            <div className="absolute inset-0 flex">
              {BMI_RANGES.map((range, i) => {
                const width = ((range.max - range.min) / (scaleMax - scaleMin)) * 100;
                const left = ((range.min - scaleMin) / (scaleMax - scaleMin)) * 100;
                return (
                  <div
                    key={i}
                    className="h-full"
                    style={{
                      backgroundColor: range.color,
                      width: `${Math.min(width, 100 - Math.max(0, left))}%`,
                      marginLeft: i === 0 ? `${Math.max(0, left)}%` : 0,
                    }}
                  />
                );
              })}
            </div>
            {/* Marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-[#2C3E50] rounded-full"
              style={{ left: `${markerPosition}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            />
          </div>

          {/* Scale labels */}
          <div className="flex justify-between text-xs text-[#AEB6BF] mt-1">
            <span>15</span>
            <span>18.5</span>
            <span>24</span>
            <span>28</span>
            <span>35</span>
          </div>
        </div>
      )}
    </div>
  );
}
