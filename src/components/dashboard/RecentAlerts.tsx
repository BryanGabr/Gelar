
import { AlertTriangle, Info, WifiOff } from 'lucide-react';

const alerts = [
  {
    title: 'Temperatura crítica',
    description: 'Freezer 03 apresentou aumento de temperatura.',
    time: 'Há 2 minutos',
    type: 'critical',
  },
  {
    title: 'Temperatura em atenção',
    description: 'Freezer 04 precisa de verificação.',
    time: 'Há 8 minutos',
    type: 'attention',
  },
  {
    title: 'Equipamento sem comunicação',
    description: 'Geladeira 01 não está enviando dados.',
    time: 'Há 12 minutos',
    type: 'offline',
  },
];

export function RecentAlerts() {
  return (
    <section className="rounded-xl border border-slate-800 bg-[#111b2b] p-5">
      <h2 className="mb-5 text-lg font-semibold">Alertas recentes</h2>

      <div className="space-y-5">
        {alerts.map((alert) => (
          <div key={alert.title} className="flex gap-3">
            <div className="mt-1">
              {alert.type === 'critical' ? (
                <AlertTriangle className="text-red-400" size={20} />
              ) : alert.type === 'attention' ? (
                <Info className="text-amber-400" size={20} />
              ) : (
                <WifiOff className="text-slate-400" size={20} />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200">
                {alert.title}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {alert.description}
              </p>
              <p className="mt-2 text-xs text-slate-500">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
