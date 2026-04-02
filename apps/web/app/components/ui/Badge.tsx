export type BadgeVariant = 'available' | 'pending' | 'assigned' | 'public' | 'private' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  available: 'bg-slate-100 text-slate-700 border-slate-300',
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  assigned: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  public: 'bg-teal-100 text-teal-800 border-teal-300',
  private: 'bg-slate-200 text-slate-800 border-slate-400',
  danger: 'bg-red-100 text-red-800 border-red-300',
};

export function Badge({ children, variant = 'available', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
