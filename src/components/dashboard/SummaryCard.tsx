
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  color: string;
}

export function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111b2b] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}
