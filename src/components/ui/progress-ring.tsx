'use client';

export interface IProgressRingProps {
  value: number;       // Current value
  max: number;         // Max/target value
  color: 'carb' | 'protein' | 'fat' | 'calories';
  size?: 'sm' | 'md' | 'lg';
  label: string;       // e.g., "碳水"
  unit?: string;       // e.g., "g" or "kcal"
  className?: string;
}

const colorStyles = {
  carb: '#F5C542',
  protein: '#E8A0BF',
  fat: '#A8D5BA',
  calories: '#FF8C42',
};

// Overflow warning colors based on excess percentage
const getOverflowColor = (excessPercent: number): string => {
  if (excessPercent <= 10) return '#FFE5E5';   // Light red
  if (excessPercent <= 20) return '#FFB3B3';   // Medium red
  return '#FF6B6B';                             // Deep red
};

const sizeConfig = {
  sm: { size: 64, strokeWidth: 5, fontSize: 10, labelSize: 8, overflowSize: 7 },
  md: { size: 80, strokeWidth: 6, fontSize: 16, labelSize: 12, overflowSize: 10 },
  lg: { size: 100, strokeWidth: 8, fontSize: 20, labelSize: 14, overflowSize: 12 },
};

export function ProgressRing({
  value,
  max,
  color,
  size = 'md',
  label,
  unit = 'g',
  className = '',
}: IProgressRingProps) {
  const config = sizeConfig[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Validate inputs to prevent NaN
  const safeValue = (value === undefined || value === null || Number.isNaN(value)) ? 0 : Number(value);
  const safeMax = (max === undefined || max === null || Number.isNaN(max) || max === 0) ? 1 : Number(max);

  // Calculate percentages
  const percentage = (safeValue / safeMax) * 100;
  const isOverflow = percentage > 100;
  const excessPercent = isOverflow ? percentage - 100 : 0;
  const excessValue = isOverflow ? safeValue - safeMax : 0;

  // Normal progress (capped at 100%)
  const normalPercentage = Math.min(percentage, 100);
  const normalOffset = circumference - (normalPercentage / 100) * circumference;

  // Overflow progress (how much of the ring shows overflow)
  const overflowPercentage = Math.min(excessPercent, 100); // Cap overflow display at 100% of ring
  const overflowOffset = circumference - (overflowPercentage / 100) * circumference;

  const overflowColor = getOverflowColor(excessPercent);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: config.size, height: config.size }}>
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={config.strokeWidth}
          />

          {/* Normal progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={colorStyles[color]}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={normalOffset}
            className="transition-all duration-500 ease-out"
          />

          {/* Overflow indicator circle (red overlay) */}
          {isOverflow && (
            <circle
              cx={config.size / 2}
              cy={config.size / 2}
              r={radius - config.strokeWidth / 2 - 1}
              fill="none"
              stroke={overflowColor}
              strokeWidth={config.strokeWidth - 2}
              strokeLinecap="round"
              strokeDasharray={circumference * 0.85}
              strokeDashoffset={overflowOffset * 0.85}
              opacity={0.8}
              className="transition-all duration-500 ease-out"
            />
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold ${isOverflow ? 'text-[#E74C3C]' : 'text-[#2C3E50]'}`}
            style={{ fontSize: config.fontSize }}
          >
            {Math.round(safeValue)}
          </span>
          <span
            className={isOverflow ? 'text-[#E74C3C]' : 'text-[#AEB6BF]'}
            style={{ fontSize: config.labelSize }}
          >
            /{Math.round(safeMax)}{unit}
          </span>
        </div>
      </div>

      {/* Label */}
      <span
        className="mt-1 text-[#5D6D7E] font-medium"
        style={{ fontSize: config.labelSize }}
      >
        {label}
      </span>

      {/* Overflow warning */}
      {isOverflow && (
        <span
          className="text-[#E74C3C] font-medium"
          style={{ fontSize: config.overflowSize }}
        >
          +{Math.round(excessValue)}{unit} ({Math.round(excessPercent)}%)
        </span>
      )}
    </div>
  );
}
