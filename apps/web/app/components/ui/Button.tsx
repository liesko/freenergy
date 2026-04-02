import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  as?: React.ElementType;
  href?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-transparent',
  secondary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm border border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
  outline: 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-sm',
};

export function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  as: Component = 'button',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  return (
    <Component className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
}
