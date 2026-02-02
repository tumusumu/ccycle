'use client';

export interface IProgressRingProps {
  completed: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { size: 60, strokeWidth: 4 },
  md: { size: 100, strokeWidth: 6 },
  lg: { size: 140, strokeWidth: 8 },
};

export function ProgressRing({
  completed,
  total,
  size = 'md',
  className = '',
}: IProgressRingProps) {
  const { size: svgSize, strokeWidth } = sizeConfig[size];
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={percentage >= 100 ? '#22c55e' : '#3b82f6'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-gray-900">
          {completed}/{total}
        </span>
        <span className="text-xs text-gray-500">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
