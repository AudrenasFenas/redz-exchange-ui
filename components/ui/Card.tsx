import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
}
