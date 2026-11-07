import { useMemo, useState, type ReactNode } from 'react';
import {
  History, Search, Thermometer, ZapOff, CheckCircle2,
  AlertTriangle, Clock3, CalendarDays, DoorOpen,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts';

type Occurrence = {
  id: number;
  equipment: string;
  type: 'temperature' | 'power' | 'door';
  description: string;
  temperature: number;
  date: string;
  start: string;
  end: string | null;
  duration: string;
  status: 'resolved' | 'active';
};

type Period = '24h' | '7d' | '30d';
type StatusFilter = 'all' | 'active' | 'resolved';

const occurrences: Occurrence[] = [
  { id: 1, equipment: 'Freezer 3', type: 'temperature', description: 'Temperatura acima do limite permitido', temperature: -0.8, date: '06/11/2026', start: '09:20', end: null, duration: '6h 41min', status: 'active' },
  { id: 2, equipment: 'Freezer 6', type: 'power', description: 'Possível interrupção de energia', temperature: -0.5, date: '06/11/2026', start: '14:35', end: null, duration: '1h 26min', status: 'active' },
  { id: 3, equipment: 'Freezer 2', type: 'temperature', description: 'Temperatura normalizada automaticamente', temperature: -5.2, date: '06/11/2026', start: '08:10', end: '08:42', duration: '32min', status: 'resolved' },
  { id: 4, equipment: 'Freezer 5', type: 'power', description: 'Alimentação elétrica restabelecida', temperature: -5.6, date: '05/11/2026', start: '18:42', end: '19:00', duration: '18min', status: 'resolved' },
  { id: 5, equipment: 'Freezer 1', type: 'temperature', description: 'Oscilação de temperatura detectada', temperature: -3.1, date: '04/11/2026', start: '11:15', end: '11:39', duration: '24min', status: 'resolved' },
  { id: 6, equipment: 'Freezer 4', type: 'power', description: 'Interrupção de energia detectada', temperature: -2.4, date: '03/11/2026', start: '16:20', end: '16:32', duration: '12min', status: 'resolved' },
];

const formatTemperature = (value: number) => `${value.toFixed(1).replace('.', ',')} °C`;

function makeTemperatureHistory(freezer: number, period: Period) {
  const count = period === '24h' ? 25 : period === '7d' ? 29 : 31;
  const base = -5.6 + freezer * 0.065;
  const end = new Date(2026, 10, 6, 16, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const progress = index / (count - 1);
    const date = new Date(end);
    if (period === '24h') date.setHours(end.getHours() - (count - 1 - index));
    else if (period === '7d') date.setHours(end.getHours() - (count - 1 - index) * 6);
    else date.setDate(end.getDate() - (count - 1 - index));

    const fluctuation = Math.sin(index * 1.4 + freezer) * 0.45 + Math.cos(index * 0.43 + freezer) * 0.28;
    const incident = freezer === 3 && progress > 0.76 ? (progress - 0.76) * 19 :
      freezer === 6 && progress > 0.83 ? (progress - 0.83) * 25 : 0;
    const temperature = Math.round((base + fluctuation + incident) * 10) / 10;

    const label = period === '24h'
      ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    return { label, temperature, fullDate: date.toLocaleString('pt-BR') };
  });
}

export default function Historico() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedFreezer, setSelectedFreezer] = useState(1);
  const [period, setPeriod] = useState<Period>('24h');
  const [onlySelected, setOnlySelected] = useState(false);

  const history = useMemo(() => makeTemperatureHistory(selectedFreezer, period), [selectedFreezer, period]);
  const values = history.map((point) => point.temperature);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;

  const filtered = occurrences.filter((item) => {
    const matchesSearch = item.equipment.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    const matchesFreezer = !onlySelected || item.equipment === `Freezer ${selectedFreezer}`;
    return matchesSearch && matchesFilter && matchesFreezer;
  });

  const resolved = occurrences.filter((item) => item.status === 'resolved').length;
  const active = occurrences.filter((item) => item.status === 'active').length;

  return (
    <main className="min-h-screen bg-[#090d16] p-4 text-white lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <History size={27} className="text-cyan-400" />
            <h1 className="text-2xl font-bold">Histórico dos Equipamentos</h1>
          </div>
          <p className="mt-2 text-sm text-slate-400">Consulte temperaturas e ocorrências dos equipamentos de refrigeração.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard title="Total de ocorrências" value={occurrences.length} icon={<History size={22} />} color="cyan" />
          <SummaryCard title="Resolvidas" value={resolved} icon={<CheckCircle2 size={22} />} color="green" />
          <SummaryCard title="Em andamento" value={active} icon={<AlertTriangle size={22} />} color="red" />
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#252b40] bg-[#111827] px-3">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Pesquisar equipamento ou ocorrência..." value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              { label: 'Todos', value: 'all' },
              { label: 'Em andamento', value: 'active' },
              { label: 'Resolvidos', value: 'resolved' },
            ] as const).map((item) => (
              <button key={item.value} type="button" onClick={() => setFilter(item.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === item.value ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/40' : 'bg-[#151d2b] text-slate-400 hover:text-white'}`}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={onlySelected} onChange={(event) => setOnlySelected(event.target.checked)} className="accent-cyan-500" />
          Mostrar apenas ocorrências do Freezer {selectedFreezer}
        </label>

        <section className="overflow-hidden rounded-xl border border-[#252b40] bg-[#111827]">
          <div className="border-b border-[#252b40] px-4 py-3">
            <h2 className="font-semibold">Registros encontrados ({filtered.length})</h2>
          </div>
          <div className="divide-y divide-[#252b40]">
            {filtered.map((item) => {
              const Icon = item.type === 'power' ? ZapOff : item.type === 'door' ? DoorOpen : Thermometer;
              const isResolved = item.status === 'resolved';
              return (
                <article key={item.id} className="p-4 hover:bg-slate-800/30">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-3 ${isResolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      <Icon size={21} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold">{item.equipment}</h3>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${isResolved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {isResolved ? 'Resolvido' : 'Em andamento'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><CalendarDays size={14} />{item.date}</span>
                        <span className="flex items-center gap-1"><Clock3 size={14} />{item.start} — {item.end ?? 'Em andamento'}</span>
                        <span className="flex items-center gap-1"><Thermometer size={14} />{formatTemperature(item.temperature)}</span>
                        <span>Duração: {item.duration}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 && <div className="p-10 text-center text-sm text-slate-400">Nenhuma ocorrência encontrada.</div>}
          </div>
        </section>
        <section className="rounded-xl border border-[#252b40] bg-[#111827] p-4 lg:p-5">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Thermometer size={21} className="text-cyan-400" /> Histórico de temperatura
              </h2>
              <p className="mt-1 text-xs text-slate-400">Leituras ilustrativas para demonstração — não são dados reais de sensores.</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs text-slate-400">
                Equipamento
                <select
                  value={selectedFreezer}
                  onChange={(event) => setSelectedFreezer(Number(event.target.value))}
                  className="rounded-lg border border-[#303b50] bg-[#151d2b] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                >
                  {Array.from({ length: 8 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>Freezer {index + 1}</option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-1 rounded-lg bg-[#151d2b] p-1">
                {(['24h', '7d', '30d'] as const).map((value) => (
                  <button key={value} type="button" onClick={() => setPeriod(value)}
                    className={`rounded-md px-3 py-2 text-xs font-semibold ${period === value ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}>
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TemperatureCard title="Mínima registrada" value={minimum} />
            <TemperatureCard title="Máxima registrada" value={maximum} />
            <TemperatureCard title="Média do período" value={average} />
          </div>

          <div className="h-72 w-full sm:h-80" role="img" aria-label={`Gráfico simulado de temperatura do Freezer ${selectedFreezer} no período de ${period}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 12, left: -18, bottom: 4 }}>
                <CartesianGrid stroke="#293244" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} minTickGap={22} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(value: number) => `${value}°`} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151d2b', border: '1px solid #334155', borderRadius: 10, color: '#fff' }}
                  labelStyle={{ color: '#cbd5e1' }}
                  formatter={(value) => [formatTemperature(Number(value)), 'Temperatura']}
                />
                <ReferenceLine y={-4} stroke="#fb7185" strokeDasharray="5 5" label={{ value: 'Limite exemplo: -4 °C', fill: '#fb7185', fontSize: 10, position: 'insideTopRight' }} />
                <Line type="monotone" dataKey="temperature" stroke="#22d3ee" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs text-slate-500">O limite de -4 °C é apenas ilustrativo. Na próxima etapa, cada freezer terá limites mínimo e máximo configuráveis.</p>
        </section>


        <p className="text-xs text-slate-500">GELAR Demo — gráficos e registros simulados para apresentação.</p>
      </div>
    </main>
  );
}

function TemperatureCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#252b40] bg-[#0d1421] p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-cyan-300">{formatTemperature(value)}</p>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }: {
  title: string; value: number; icon: ReactNode; color: 'cyan' | 'green' | 'red';
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
        <div className={`rounded-lg p-2 ${colors[color]}`}>{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
