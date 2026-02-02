'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

export interface ISelectOption {
  value: string;
  label: string;
}

export interface ISelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: ISelectOption[];
  error?: string;
  onChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, ISelectProps>(
  ({ label, options, error, onChange, className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-[#2C3E50] mb-1">
          {label}
        </label>
        <select
          ref={ref}
          onChange={handleChange}
          className={`
            w-full px-3 py-2.5
            border rounded-[12px]
            bg-white
            text-[#2C3E50]
            focus:outline-none focus:ring-2 focus:ring-[#4A90D9] focus:border-transparent
            disabled:bg-[#EEF2F7] disabled:cursor-not-allowed
            ${error ? 'border-[#E74C3C]' : 'border-[#CCCCCC]'}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-[#E74C3C]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
