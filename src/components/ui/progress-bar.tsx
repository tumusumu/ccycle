'use client';

export interface IProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'carb' | 'protein' | 'fat' | 'water';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorStyles = {
  green: '#5CB85C',
  blue: '#4A90D9',
  yellow: '#F5C542',
  red: '#E74C3C',
  carb: '#F5C542',
  protein: '#E8A0BF',
  fat: '#A8D5BA',
  water: '#7EC8E3',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  label,
  showPercentage = false,
  color = 'blue',
  size = 'md',
  className = '',
}: IProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm text-[#5D6D7E]">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-[#2C3E50]">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeStyles[size]}`}>
        <div
          className={`${sizeStyles[size]} rounded-full transition-all duration-300`}
          style={{
            width: `${clampedValue}%`,
            backgroundColor: colorStyles[color],
          }}
        />
      </div>
    </div>
  );
}
