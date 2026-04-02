interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, description, action, icon }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100">{icon}</div>}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
