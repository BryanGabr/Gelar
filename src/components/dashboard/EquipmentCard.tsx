
import { Clock3, Thermometer, WifiOff } from 'lucide-react';
import type { Equipment } from '../../data/equipment';

interface EquipmentCardProps {
  equipment: Equipment;
}

const statusConfig = {
  normal: {
    label: 'Normal',
    style: 'bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400',
  },
  attention: {
    label: 'Atenção',
    style: 'bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
  },
  critical: {
    label: 'Crítico',
    style: 'bg-red-500/10 text-red-400',
    dot: 'bg-red-400',
  },
  offline: {
    label: 'Sem comunicação',
    style: 'bg-slate-500/10 text-slate-400',
    dot: 'bg-slate-400',
  },
};

export function EquipmentCard({ equipment }: EquipmentCardProps) {
  const status = statusConfig[equipment.status];

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111b2b] p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-100">{equipment.name}</p>
          <p className="mt-1 text-xs text-slate-500">{equipment.type}</p>
        </div>

        <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${status.style}`}>
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        {equipment.status === 'offline' ? (
          <WifiOff className="text-slate-500" size={25} />
        ) : (
          <Thermometer className="text-cyan-400" size={25} />
        )}

        <span className="text-3xl font-bold">
          {equipment.temperature}°C
        </span>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-800 pt-4 text-xs text-slate-500">
        <Clock3 size={14} />
        Atualização: {equipment.lastUpdate}
      </div>
    </div>
  );
}
