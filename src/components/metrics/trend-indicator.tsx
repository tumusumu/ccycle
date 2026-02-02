'use client';

export interface ITrendIndicatorProps {
  value: number; // Change value (e.g., -0.5 for -0.5kg/week)
  unit: string;
  period?: string; // e.g., "周" or "月"
  positiveIsGood?: boolean; // For weight/body fat, decrease is good. For muscle, increase is good.
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: {
    container: 'text-xs',
    arrow: 'w-3 h-3',
  },
  md: {
    container: 'text-sm',
    arrow: 'w-4 h-4',
  },
  lg: {
    container: 'text-base',
    arrow: 'w-5 h-5',
  },
};

export function TrendIndicator({
  value,
  unit,
  period = '周',
  positiveIsGood = false,
  size = 'md',
  className = '',
}: ITrendIndicatorProps) {
  const styles = sizeStyles[size];
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isStable = Math.abs(value) < 0.01;

  // Determine if the trend is "good" or "bad"
  const isGood = isStable || (positiveIsGood ? isPositive : isNegative);

  const color = isStable ? '#5D6D7E' : isGood ? '#5CB85C' : '#E74C3C';
  const bgColor = isStable ? '#EEF2F7' : isGood ? '#F0FDF4' : '#FEF2F2';

  const displayValue = Math.abs(value).toFixed(1);
  const sign = isPositive ? '+' : isNegative ? '-' : '';

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${styles.container} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Arrow */}
      {!isStable && (
        <svg
          className={styles.arrow}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isPositive ? 'rotate(-45deg)' : 'rotate(45deg)',
          }}
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      )}

      {/* Stable icon */}
      {isStable && (
        <svg
          className={styles.arrow}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}

      {/* Value */}
      <span style={{ color }} className="font-medium">
        {sign}{displayValue}{unit}/{period}
      </span>
    </div>
  );
}

// Compact version for use in tight spaces
export function TrendArrow({
  direction,
  isGood,
  className = '',
}: {
  direction: 'up' | 'down' | 'stable';
  isGood?: boolean;
  className?: string;
}) {
  const color = isGood === undefined
    ? '#5D6D7E'
    : isGood
      ? '#5CB85C'
      : '#E74C3C';

  if (direction === 'stable') {
    return (
      <span className={`text-[#5D6D7E] ${className}`}>—</span>
    );
  }

  return (
    <span style={{ color }} className={className}>
      {direction === 'up' ? '↑' : '↓'}
    </span>
  );
}
