
import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Refrigerator,
  Thermometer,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Period = '24h' | '7d' | '30d';

const dataByPeriod = {
  '24h': [
    { time: '00h', freezer1: -5.5, freezer3: -5.1, freezer6: -5.3 },
    { time: '04h', freezer1: -5.2, freezer3: -4.8, freezer6: -5.1 },
    { time: '08h', freezer1: -5.4, freezer3: -3.6, freezer6: -5.0 },
    { time: '12h', freezer1: -5.1, freezer3: -2.1, freezer6: -4.4 },
    { time: '16h', freezer1: -5.5, freezer3: -0.8, freezer6: -0.5 },
    { time: '20h', freezer1: -5.3, freezer3: -1.2, freezer6: -1.1 },
  ],
  '7d': [
    { time: 'Seg', freezer1: -5.4, freezer3: -5.1, freezer6: -5.2 },
    { time: 'Ter', freezer1: -5.2, freezer3: -4.7, freezer6: -5.0 },
    { time: 'Qua', freezer1: -5.5, freezer3: -3.8, freezer6: -4.8 },
    { time: 'Qui', freezer1: -5.3, freezer3: -2.9, freezer6: -4.5 },
    { time: 'Sex', freezer1: -5.4, freezer3: -0.8, freezer6: -0.5 },
    { time: 'Sáb', freezer1: -5.2, freezer3: -1.4, freezer6: -1.2 },
    { time: 'Dom', freezer1: -5.5, freezer3: -2.0, freezer6: -2.1 },
  ],
  '30d': [
    { time: 'Sem 1', freezer1: -5.4, freezer3: -5.1, freezer6: -5.2 },
    { time: 'Sem 2', freezer1: -5.3, freezer3: -4.6, freezer6: -4.9 },
    { time: 'Sem 3', freezer1: -5.5, freezer3: -3.2, freezer6: -4.1 },
    { time: 'Sem 4', freezer1: -5.2, freezer3: -1.5, freezer6: -1.8 },
  ],
};

const equipment = [
  { name: 'Freezer 1', temperature: -5.5, alerts: 1, status: 'Normal' },
  { name: 'Freezer 2', temperature: -5.2, alerts: 1, status: 'Normal' },
  { name: 'Freezer 3', temperature: -0.8, alerts: 4, status: 'Alerta' },
  { name: 'Freezer 4', temperature: -5.1, alerts: 1, status: 'Normal' },
  { name: 'Freezer 5', temperature: -5.6, alerts: 1, status: 'Normal' },
  { name: 'Freezer 6', temperature: -0.5, alerts: 3, status: 'Alerta' },
  { name: 'Freezer 7', temperature: -5.4, alerts: 0, status: 'Normal' },
  { name: 'Freezer 8', temperature: -5.0, alerts: 0, status: 'Normal' },
];

const formatTemperature = (value: number) =>
  `${value.toFixed(1).replace('.', ',')} °C`;

export default function Relatorios() {
  const [period, setPeriod] = useState<Period>('24h');
  const chartData = dataByPeriod[period];

  const normalCount = equipment.filter(
    (item) => item.status === 'Normal'
  ).length;

  const alertCount = equipment.length - normalCount;

  return (
    <main className="min-h-screen bg-[#090d16] p-4 text-white lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* CABEÇALHO */}
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 size={27} className="text-cyan-400" />
            <h1 className="text-2xl font-bold">Relatórios</h1>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Acompanhe o desempenho dos equipamentos de refrigeração.
          </p>
        </div>

        {/* INDICADORES */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Equipamentos"
            value={equipment.length.toString()}
            icon={<Refrigerator size={22} />}
            color="cyan"
          />
          <SummaryCard
            title="Funcionando normalmente"
            value={normalCount.toString()}
            icon={<CheckCircle2 size={22} />}
            color="green"
          />
          <SummaryCard
            title="Em alerta"
            value={alertCount.toString()}
            icon={<AlertTriangle size={22} />}
            color="red"
          />
          <SummaryCard
            title="Disponibilidade estimada"
            value="97,8%"
            icon={<Activity size={22} />}
            color="cyan"
          />
        </div>

        {/* GRÁFICO */}
        <section className="rounded-xl border border-[#252b40] bg-[#111827] p-4 lg:p-5">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 font-bold">
                <Thermometer size={19} className="text-cyan-400" />
                Histórico de temperatura
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Comparação de três equipamentos — dados simulados
              </p>
            </div>

            <div className="flex gap-2">
              {(['24h', '7d', '30d'] as Period[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                    period === item
                      ? 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/40'
                      : 'bg-[#1b2230] text-slate-400 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  stroke="#293244"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                  domain={[-7, 1]}
                  unit="°"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151d2b',
                    border: '1px solid #293244',
                    borderRadius: 10,
                    color: '#fff',
                  }}
                  formatter={(value, name) => [
                    `${Number(value).toFixed(1).replace('.', ',')} °C`,
                    String(name),
                  ]}
                />
                <Line
                  name="Freezer 1"
                  type="monotone"
                  dataKey="freezer1"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  name="Freezer 3"
                  type="monotone"
                  dataKey="freezer3"
                  stroke="#f87171"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  name="Freezer 6"
                  type="monotone"
                  dataKey="freezer6"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Limite de referência dos equipamentos: -4 °C.
          </p>
        </section>

        {/* DESEMPENHO POR EQUIPAMENTO */}
        <section className="overflow-hidden rounded-xl border border-[#252b40] bg-[#111827]">
          <div className="border-b border-[#252b40] p-4">
            <h2 className="font-bold">Resumo dos equipamentos</h2>
            <p className="mt-1 text-xs text-slate-400">
              Temperaturas atuais e ocorrências demonstrativas.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead className="bg-[#151d2b] text-xs text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Equipamento</th>
                  <th className="px-4 py-3 font-medium">Temperatura</th>
                  <th className="px-4 py-3 font-medium">Ocorrências</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#252b40]">
                {equipment.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                    <td className="px-4 py-3">
                      {formatTemperature(item.temperature)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.alerts}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item.status === 'Normal'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* OBSERVAÇÃO */}
        <div className="flex items-start gap-2 text-xs text-slate-500">
          <Clock3 size={15} className="shrink-0" />
          <p>
            GELAR Demo — temperaturas, indicadores, disponibilidade e
            ocorrências são dados simulados para apresentação.
          </p>
        </div>
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
  value: string;
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
