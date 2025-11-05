import { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export function Input({
  label,
  helperText,
  className,
  ...props
}: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-primary-500',
          className
        )}
        {...props}
      />
      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}
