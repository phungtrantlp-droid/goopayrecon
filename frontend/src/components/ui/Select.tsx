import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, helperText, options, ...props }, ref) => {
    const id = props.id || props.name;
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label htmlFor={id} className="text-sm font-medium text-gray-300">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={`w-full appearance-none bg-[#0d1117] border rounded-md text-white focus:outline-none focus:ring-1 transition-colors px-3 py-2 text-sm
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#30363d] focus:border-accent focus:ring-accent'}
              ${className}
            `}
            {...props}
          >
            <option value="" disabled hidden>Chọn...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0d1117] text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
        {helperText && !error && <span className="text-xs text-gray-500">{helperText}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
