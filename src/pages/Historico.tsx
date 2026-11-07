
import { useState } from 'react';
import {
  History,
  Search,
  Thermometer,
  ZapOff,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  CalendarDays,
} from 'lucide-react';

type Occurrence = {
  id: number;
  equipment: string;
  type: 'temperature' | 'power';
  description: string;
  temperature: number;
  date: string;
  start: string;
  end: string | null;
  duration: string;
  status: 'resolved' | 'active';
};

const occurrences: Occurrence[] = [
  {
    id: 1,
    equipment: 'Freezer 3',
    type: 'temperature',
    description: 'Temperatura acima do limite permitido',
    temperature: -0.8,
    date: '06/11/2026',
    start: '09:20',
    end: null,
    duration: '6h 41min',
    status: 'active',
  },
  {
    id: 2,
    equipment: 'Freezer 6',
    type: 'power',
    description: 'Possível interrupção de energia',
    temperature: -0.5,
    date: '06/11/2026',
    start: '14:35',
    end: null,
    duration: '1h 26min',
    status: 'active',
  },
  {
    id: 3,
    equipment: 'Freezer 2',
    type: 'temperature',
    description: 'Temperatura normalizada automaticamente',
    temperature: -5.2,
    date: '06/11/2026',
    start: '08:10',
    end: '08:42',
    duration: '32min',
    status: 'resolved',
  },
  {
    id: 4,
    equipment: 'Freezer 5',
    type: 'power',
    description: 'Alimentação elétrica restabelecida',
    temperature: -5.6,
    date: '05/11/2026',
    start: '18:42',
    end: '19:00',
    duration: '18min',
    status: 'resolved',
  },
  {
    id: 5,
    equipment: 'Freezer 1',
    type: 'temperature',
    description: 'Oscilação de temperatura detectada',
    temperature: -3.1,
    date: '04/11/2026',
    start: '11:15',
    end: '11:39',
    duration: '24min',
    status: 'resolved',
  },
  {
    id: 6,
    equipment: 'Freezer 4',
    type: 'power',
    description: 'Interrupção de energia detectada',
    temperature: -2.4,
    date: '03/11/2026',
    start: '16:20',
    end: '16:32',
    duration: '12min',
    status: 'resolved',
  },
];

export default function Historico() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const filtered = occurrences.filter((item) => {
    const matchesSearch =
      item.equipment.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'all' || item.status === filter;

    return matchesSearch && matchesFilter;
  });

  const resolved = occurrences.filter(
    (item) => item.status === 'resolved'
  ).length;

  const active = occurrences.filter(
    (item) => item.status === 'active'
  ).length;

  return (
    <main className="min-h-screen bg-[#090d16] p-4 text-white lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* CABEÇALHO */}
        <div>
          <div className="flex items-center gap-3">
            <History size={27} className="text-cyan-400" />
            <h1 className="text-2xl font-bold">
              Histórico de Ocorrências
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Consulte os eventos registrados nos equipamentos de refrigeração.
          </p>
        </div>

        {/* INDICADORES */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Total de ocorrências"
            value={occurrences.length}
            icon={<History size={22} />}
            color="cyan"
          />
          <SummaryCard
            title="Resolvidas"
            value={resolved}
            icon={<CheckCircle2 size={22} />}
            color="green"
          />
          <SummaryCard
            title="Em andamento"
            value={active}
            icon={<AlertTriangle size={22} />}
            color="red"
          />
        </div>

        {/* PESQUISA E FILTROS */}
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#252b40] bg-[#111827] px-3">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar equipamento ou ocorrência..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Todos', value: 'all' },
              { label: 'Em andamento', value: 'active' },
              { label: 'Resolvidos', value: 'resolved' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  setFilter(item.value as 'all' | 'active' | 'resolved')
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filter === item.value
                    ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/40'
                    : 'bg-[#151d2b] text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* LISTA */}
        <div className="overflow-hidden rounded-xl border border-[#252b40] bg-[#111827]">
          <div className="border-b border-[#252b40] px-4 py-3">
            <h2 className="font-semibold">
              Registros encontrados ({filtered.length})
            </h2>
          </div>

          <div className="divide-y divide-[#252b40]">
            {filtered.map((item) => {
              const Icon = item.type === 'power' ? ZapOff : Thermometer;
              const isResolved = item.status === 'resolved';

              return (
                <article key={item.id} className="p-4 hover:bg-slate-800/30">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-lg p-3 ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        <Icon size={21} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold">{item.equipment}</h3>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                              isResolved
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {isResolved ? 'Resolvido' : 'Em andamento'}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-300">
                          {item.description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} />
                            {item.date}
                          </span>

                          <span className="flex items-center gap-1">
                            <Clock3 size={14} />
                            {item.start} — {item.end ?? 'Em andamento'}
                          </span>

                          <span className="flex items-center gap-1">
                            <Thermometer size={14} />
                            {item.temperature.toFixed(1).replace('.', ',')} °C
                          </span>

                          <span>Duração: {item.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-400">
                Nenhuma ocorrência encontrada.
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          GELAR Demo — registros simulados para apresentação.
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
  color: 'cyan' | 'green' | 'red';
}) {
  const colors = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    green: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400',
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
