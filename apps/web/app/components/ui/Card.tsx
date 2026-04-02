import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white shadow-sm border border-slate-200 rounded-2xl p-6 transition-all duration-200 hover:shadow-md hover:border-slate-300 ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
