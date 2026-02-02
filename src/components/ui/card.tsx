'use client';

import { ReactNode } from 'react';

export interface ICardProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'highlight' | 'warning' | 'success';
  className?: string;
  children: ReactNode;
}

const variantStyles = {
  default: 'bg-white',
  highlight: 'bg-[#EEF2F7] ring-1 ring-[#4A90D9]',
  warning: 'bg-[#FEF2F2] ring-1 ring-[#E74C3C]',
  success: 'bg-[#F0FDF4] ring-1 ring-[#5CB85C]',
};

export function Card({
  title,
  subtitle,
  variant = 'default',
  className = '',
  children,
}: ICardProps) {
  return (
    <div
      className={`
        rounded-[16px] p-4
        ${variantStyles[variant]}
        ${className}
      `}
      style={{
        boxShadow: variant === 'default' ? '0 2px 8px rgba(0,0,0,0.06)' : undefined,
      }}
    >
      {title && (
        <h3 className="mb-1 text-lg font-semibold text-[#2C3E50]">{title}</h3>
      )}
      {subtitle && (
        <p className="mb-3 text-sm text-[#5D6D7E]">{subtitle}</p>
      )}
      {!subtitle && title && <div className="mb-3" />}
      {children}
    </div>
  );
}
