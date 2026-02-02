'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'pill';
  loading?: boolean;
}

const variantStyles = {
  primary:
    'bg-[#4A90D9] text-white hover:bg-[#357ABD] focus:ring-[#4A90D9] disabled:opacity-50',
  secondary:
    'bg-white text-[#4A90D9] border border-[#4A90D9] hover:bg-[#EEF2F7] focus:ring-[#4A90D9] disabled:opacity-50',
  danger:
    'bg-[#E74C3C] text-white hover:bg-[#C0392B] focus:ring-[#E74C3C] disabled:opacity-50',
  ghost:
    'bg-transparent text-[#5D6D7E] hover:bg-[#EEF2F7] focus:ring-[#4A90D9]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-[10px]',
  md: 'px-4 py-2.5 text-base rounded-[12px]',
  lg: 'px-6 py-3 text-lg rounded-[12px]',
  pill: 'px-4 py-2 text-sm rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center
          font-medium
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            加载中...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
