'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export interface ICheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (checked: boolean) => void;
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const labelSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Checkbox = forwardRef<HTMLInputElement, ICheckboxProps>(
  ({ label, size = 'md', checked, onChange, className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.checked);
      }
    };

    return (
      <label
        className={`
          flex items-center gap-3 cursor-pointer
          ${className}
        `}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className={`
            ${sizeStyles[size]}
            rounded border-[#CCCCCC]
            text-[#5CB85C]
            focus:ring-[#4A90D9] focus:ring-2
            cursor-pointer
            accent-[#5CB85C]
          `}
          {...props}
        />
        <span className={`${labelSizeStyles[size]} text-[#5D6D7E]`}>{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
