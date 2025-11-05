import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'font-semibold rounded-xl transition-colors',
        {
          // Variant styles
          'bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white':
            variant === 'primary',
          'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white':
            variant === 'secondary',
          'bg-transparent hover:bg-gray-700 disabled:bg-transparent text-gray-300':
            variant === 'ghost',
          
          // Size styles
          'px-3 py-2 text-sm': size === 'sm',
          'px-4 py-3': size === 'md',
          'px-6 py-4': size === 'lg',
          
          // Width styles
          'w-full': fullWidth,
          
          // Disabled styles
          'disabled:cursor-not-allowed disabled:opacity-50': true,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
