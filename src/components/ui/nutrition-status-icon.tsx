'use client';

type TStatus = 'achieved' | 'exceeded' | 'insufficient';

interface INutritionStatusIconProps {
  status: TStatus;
  size?: number;
  className?: string;
}

export function NutritionStatusIcon({
  status,
  size = 18,
  className = ''
}: INutritionStatusIconProps) {
  if (status === 'achieved') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        className={className}
        aria-label="达标"
      >
        {/* Green circle background with subtle gradient */}
        <circle cx="10" cy="10" r="10" fill="url(#achievedGradient)"/>
        {/* White checkmark */}
        <path
          d="M6 10L8.5 12.5L14 7"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Subtle inner shadow for depth */}
        <circle
          cx="10"
          cy="10"
          r="9"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          fill="none"
        />
        <defs>
          <linearGradient id="achievedGradient" x1="0" y1="0" x2="20" y2="20">
            <stop offset="0%" stopColor="#6DD47E"/>
            <stop offset="100%" stopColor="#5CB85C"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (status === 'exceeded') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        className={className}
        aria-label="超标"
      >
        {/* Red circle background with subtle gradient */}
        <circle cx="10" cy="10" r="10" fill="url(#exceededGradient)"/>
        {/* White exclamation mark */}
        <path
          d="M10 5V11"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="14.5" r="1.5" fill="white"/>
        {/* Subtle inner highlight */}
        <circle
          cx="10"
          cy="10"
          r="9"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="none"
        />
        <defs>
          <linearGradient id="exceededGradient" x1="0" y1="0" x2="20" y2="20">
            <stop offset="0%" stopColor="#FF8080"/>
            <stop offset="100%" stopColor="#FF6B6B"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // insufficient
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-label="不足"
    >
      {/* Gray circle outline */}
      <circle
        cx="10"
        cy="10"
        r="8.5"
        stroke="#D1D5DB"
        strokeWidth="2"
        fill="white"
      />
      {/* Gray down arrow */}
      <path
        d="M10 6V12M7 10L10 13L13 10"
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Determine nutrition status based on actual vs target values
 * @param actual - Actual intake value
 * @param target - Target value
 * @returns Status: 'achieved' (90-110%), 'exceeded' (>110%), 'insufficient' (<90%)
 */
export function getNutritionStatus(actual: number, target: number): TStatus {
  if (target <= 0) return 'insufficient';

  const percentage = (actual / target) * 100;

  if (percentage >= 90 && percentage <= 110) return 'achieved';
  if (percentage > 110) return 'exceeded';
  return 'insufficient';
}

export type { TStatus, INutritionStatusIconProps };
