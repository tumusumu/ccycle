'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export interface IInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  onChange?: (value: string | number) => void;
}

export const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ label, error, onChange, type = 'text', className = '', value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        const newValue =
          type === 'number' ? parseFloat(e.target.value) : e.target.value;
        onChange(newValue);
      }
    };

    // Handle NaN values for number inputs
    const safeValue = type === 'number' && typeof value === 'number' && isNaN(value)
      ? ''
      : value;

    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-[#2C3E50] mb-1">
          {label}
        </label>
        <input
          ref={ref}
          type={type}
          value={safeValue}
          onChange={handleChange}
          className={`
            w-full px-3 py-2.5
            border rounded-[12px]
            bg-white
            text-[#2C3E50]
            placeholder:text-[#AEB6BF]
            focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent
            disabled:bg-[#EEF2F7] disabled:cursor-not-allowed
            ${error ? 'border-[#E74C3C]' : 'border-[#CCCCCC]'}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[#E74C3C]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
