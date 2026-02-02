'use client';

export interface IProgressRingProps {
  value: number;       // Current value
  max: number;         // Max/target value
  color: 'carb' | 'protein' | 'fat' | 'water';
  size?: 'sm' | 'md' | 'lg';
  label: string;       // e.g., "碳水"
  unit?: string;       // e.g., "g" or "ml"
  className?: string;
}

const colorStyles = {
  carb: '#F5C542',
  protein: '#E8A0BF',
  fat: '#A8D5BA',
  water: '#7EC8E3',
};

const sizeConfig = {
  sm: { size: 60, strokeWidth: 5, fontSize: 12, labelSize: 10 },
  md: { size: 80, strokeWidth: 6, fontSize: 16, labelSize: 12 },
  lg: { size: 100, strokeWidth: 8, fontSize: 20, labelSize: 14 },
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

  const percentage = Math.min((safeValue / safeMax) * 100, 100);
  const rawOffset = circumference - (percentage / 100) * circumference;
  const strokeDashoffset = Number.isNaN(rawOffset) ? circumference : rawOffset;

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
          {/* Progress circle */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={colorStyles[color]}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          <span
            className="font-bold text-[#2C3E50]"
            style={{ fontSize: config.fontSize }}
          >
            {Math.round(safeValue)}
          </span>
          <span
            className="text-[#AEB6BF]"
            style={{ fontSize: config.labelSize }}
          >
            /{safeMax}{unit}
          </span>
        </div>
      </div>
      <span
        className="mt-1 text-[#5D6D7E] font-medium"
        style={{ fontSize: config.labelSize }}
      >
        {label}
      </span>
    </div>
  );
}
