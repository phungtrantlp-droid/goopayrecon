import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, prefix, suffix, ...props }, ref) => {
    const id = props.id || props.name;
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label htmlFor={id} className="text-sm font-medium text-gray-300">{label}</label>}
        <div className="relative flex items-center">
          {prefix && <div className="absolute left-3 text-gray-400">{prefix}</div>}
          <input
            ref={ref}
            id={id}
            className={`w-full bg-[#0d1117] border rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors px-3 py-2 text-sm
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#30363d] focus:border-accent focus:ring-accent'}
              ${prefix ? 'pl-9' : ''}
              ${suffix ? 'pr-9' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && <div className="absolute right-3 text-gray-400">{suffix}</div>}
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
        {helperText && !error && <span className="text-xs text-gray-500">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
