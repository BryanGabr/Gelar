
import { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Refrigerator,
  Thermometer,
  ZapOff,
} from 'lucide-react';

type AlertStatus = 'active' | 'resolved';
type AlertType = 'temperature' | 'power';

type Alert = {
  id: number;
  equipment: string;
  type: AlertType;
  message: string;
  temperature: number;
  time: string;
  duration: string;
  status: AlertStatus;
};

const initialAlerts: Alert[] = [
  {
    id: 1,
    equipment: 'Freezer 3',
    type: 'temperature',
    message: 'Temperatura acima do limite permitido',
    temperature: -0.8,
    time: '09:20',
    duration: '6h 41min',
    status: 'active',
  },
  {
    id: 2,
    equipment: 'Freezer 6',
    type: 'power',
    message: 'Possível falta de energia no equipamento',
    temperature: -0.5,
    time: '14:35',
    duration: '1h 26min',
    status: 'active',
  },
  {
    id: 3,
    equipment: 'Freezer 2',
    type: 'temperature',
    message: 'Temperatura normalizada automaticamente',
    temperature: -5.2,
    time: '08:10',
    duration: '32min',
    status: 'resolved',
  },
  {
    id: 4,
    equipment: 'Freezer 5',
    type: 'power',
    message: 'Alimentação elétrica restabelecida',
    temperature: -5.6,
    time: 'Ontem, 18:42',
    duration: '18min',
    status: 'resolved',
  },
];

export default function Alertas() {
  const [filter, setFilter] = useState<'all' | AlertStatus>('active');

  const activeCount = initialAlerts.filter(
    (alert) => alert.status === 'active'
  ).length;

  const resolvedCount = initialAlerts.filter(
    (alert) => alert.status === 'resolved'
  ).length;

  const filteredAlerts = initialAlerts.filter(
    (alert) => filter === 'all' || alert.status === filter
  );

  return (
    <main className="min-h-screen bg-[#090d16] p-4 text-white lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* CABEÇALHO */}
        <div>
          <div className="flex items-center gap-3">
            <Bell className="text-cyan-400" size={27} />
            <h1 className="text-2xl font-bold">Central de Alertas</h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Acompanhe automaticamente as ocorrências dos equipamentos.
          </p>
        </div>

        {/* RESUMO */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Alertas ativos"
            value={activeCount}
            color="red"
            icon={<AlertTriangle size={22} />}
          />
          <SummaryCard
            title="Resolvidos"
            value={resolvedCount}
            color="green"
            icon={<CheckCircle2 size={22} />}
          />
          <SummaryCard
            title="Total de ocorrências"
            value={initialAlerts.length}
            color="cyan"
            icon={<Bell size={22} />}
          />
        </div>

        {/* FILTROS */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Ativos', value: 'active' },
            { label: 'Resolvidos', value: 'resolved' },
            { label: 'Todos', value: 'all' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                setFilter(item.value as 'all' | AlertStatus)
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === item.value
                  ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/40'
                  : 'bg-[#151d2b] text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* LISTA DE ALERTAS */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isResolved = alert.status === 'resolved';
            const Icon = alert.type === 'power' ? ZapOff : Thermometer;

            return (
              <article
                key={alert.id}
                className={`rounded-xl border p-4 ${
                  isResolved
                    ? 'border-[#252b40] bg-[#111827]'
                    : 'border-red-500/40 bg-[#21151c]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-lg p-3 ${
                      isResolved
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    <Icon size={23} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold">{alert.equipment}</h2>

                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {isResolved ? 'Resolvido automaticamente' : 'Ativo'}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      {alert.message}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Thermometer size={14} />
                        {alert.temperature.toFixed(1).replace('.', ',')} °C
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock3 size={14} />
                        {alert.time}
                      </span>

                      <span className="flex items-center gap-1">
                        <Refrigerator size={14} />
                        Duração: {alert.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="rounded-xl border border-slate-800 bg-[#111827] p-10 text-center">
              <CheckCircle2
                size={36}
                className="mx-auto mb-3 text-emerald-400"
              />
              <p className="text-slate-300">
                Nenhum alerta encontrado neste filtro.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">
          GELAR Demo — dados simulados para apresentação.
        </p>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'red' | 'green' | 'cyan';
}) {
  const colors = {
    red: 'text-red-400 bg-red-500/10',
    green: 'text-emerald-400 bg-emerald-500/10',
    cyan: 'text-cyan-400 bg-cyan-500/10',
  };

  return (
    <div className="rounded-xl border border-[#252b40] bg-[#111827] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
