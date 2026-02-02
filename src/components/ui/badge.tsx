'use client';

import { ReactNode } from 'react';

export interface IBadgeProps {
  variant: 'low' | 'medium' | 'high' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  // Carb day types with design system colors
  low: 'bg-[#A8D5BA] text-white',      // Low carb - mint green
  medium: 'bg-[#F5C542] text-white',   // Medium carb - warm yellow
  high: 'bg-[#E74C3C] text-white',     // High carb - red
  // Status badges
  success: 'bg-[#5CB85C] text-white',  // Success - green
  warning: 'bg-[#F5C542] text-white',  // Warning - yellow
  error: 'bg-[#E74C3C] text-white',    // Error - red
  info: 'bg-[#4A90D9] text-white',     // Info - primary blue
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function Badge({
  variant,
  size = 'md',
  children,
  className = '',
}: IBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
