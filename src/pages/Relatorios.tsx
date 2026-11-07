import { useMemo, useState, type ReactNode } from 'react';
import {
  FileText, Printer, Download, Clock3, AlertTriangle, CheckCircle2, PhoneCall,
} from 'lucide-react';

import { loadOccurrences, seedOccurrences, type OccurrenceRecord } from '../data/ocorrencias';

type Period = 'dia' | 'semana' | 'mes';

const PERIODS: { value: Period; label: string; days: number; title: string }[] = [
  { value: 'dia', label: 'Diário', days: 1, title: 'Relatório diário' },
  { value: 'semana', label: 'Semanal', days: 7, title: 'Relatório semanal' },
  { value: 'mes', label: 'Mensal', days: 30, title: 'Relatório mensal' },
];

const TYPE_LABEL: Record<OccurrenceRecord['type'], string> = {
  temperature: 'Temperatura',
  power: 'Energia',
  door: 'Porta aberta',
};

// "dd/mm/aaaa" -> dia absoluto (para comparar períodos sem fuso)
function dayNumber(date: string) {
  const [d, m, y] = date.split('/').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

// "6h 41min", "32min" ou "05:30" (mm:ss) -> minutos
function minutesOf(text: string) {
  const clock = /^(\d+):(\d+)$/.exec(text.trim());
  if (clock) return Number(clock[1]) + Number(clock[2]) / 60;
  const hours = /(\d+)\s*h/.exec(text);
  const mins = /(\d+)\s*min/.exec(text);
  return (hours ? Number(hours[1]) * 60 : 0) + (mins ? Number(mins[1]) : 0);
}

function formatMinutes(total: number) {
  const rounded = Math.round(total);
  if (rounded < 60) return `${rounded} min`;
  return `${Math.floor(rounded / 60)} h ${String(rounded % 60).padStart(2, '0')} min`;
}

function csvCell(value: string | number | undefined | null) {
  const text = value === undefined || value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function Relatorios() {
  const [period, setPeriod] = useState<Period>('dia');

  const all = useMemo<OccurrenceRecord[]>(() => [...loadOccurrences(), ...seedOccurrences], []);
  const reference = useMemo(() => Math.max(...all.map((item) => dayNumber(item.date))), [all]);
  const config = PERIODS.find((item) => item.value === period)!;

  const rows = useMemo(
    () => all.filter((item) => reference - dayNumber(item.date) < config.days)
      .sort((a, b) => dayNumber(b.date) - dayNumber(a.date) || b.start.localeCompare(a.start)),
    [all, reference, config.days],
  );

  const resolved = rows.filter((item) => item.status === 'resolved').length;
  const active = rows.length - resolved;
  const durations = rows.map((item) => minutesOf(item.duration)).filter((value) => value > 0);
  const averageDuration = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : null;
  const escalated = rows.filter((item) => item.escalatedAt).length;
  const longest = rows.reduce((max, item) => Math.max(max, minutesOf(item.duration)), 0);

  const byEquipment = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((item) => counts.set(item.equipment, (counts.get(item.equipment) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);
  const maxCount = byEquipment.length ? byEquipment[0][1] : 1;

  const periodLabel = useMemo(() => {
    const end = new Date(reference * 86400000);
    const start = new Date((reference - config.days + 1) * 86400000);
    const fmt = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
    return config.days === 1 ? fmt(end) : `${fmt(start)} a ${fmt(end)}`;
  }, [reference, config.days]);

  const downloadCsv = () => {
    const header = ['Data', 'Equipamento', 'Tipo', 'Descrição', 'Início', 'Fim', 'Duração', 'Temperatura (°C)', 'Encerrado por', 'Dono avisado às', 'Situação'];
    const lines = rows.map((item) => [
      item.date, item.equipment, TYPE_LABEL[item.type], item.description, item.start, item.end ?? '', item.duration,
      item.temperature, item.resolvedBy, item.escalatedAt,
      item.status === 'resolved' ? 'Resolvido' : 'Em andamento',
    ].map(csvCell).join(';'));
    const blob = new Blob(['﻿' + [header.map(csvCell).join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gelar-relatorio-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#090d16] p-4 text-white lg:p-6 print:bg-white print:p-0 print:text-black">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <FileText size={27} className="text-cyan-400" />
              <h1 className="text-2xl font-bold">{config.title}</h1>
            </div>
            <p className="mt-2 text-sm text-slate-400 print:text-slate-600">
              Pôr do Sol · período: {periodLabel} · quanto durou cada ocorrência, se o dono foi avisado e o que ficou pendente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <div className="flex gap-1 rounded-lg bg-[#151d2b] p-1">
              {PERIODS.map((item) => (
                <button key={item.value} type="button" onClick={() => setPeriod(item.value)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold ${period === item.value ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}>
                  {item.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={downloadCsv}
              className="flex items-center gap-2 rounded-lg bg-[#151d2b] px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-[#1c2740]">
              <Download size={16} /> Baixar CSV
            </button>
            <button type="button" onClick={() => window.print()}
              className="flex items-center gap-2 rounded-lg bg-cyan-500/20 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/30">
              <Printer size={16} /> Imprimir / salvar PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Kpi title="Ocorrências" value={rows.length} icon={<AlertTriangle size={20} />} tone="cyan" />
          <Kpi title="Resolvidas" value={resolved} icon={<CheckCircle2 size={20} />} tone="green" />
          <Kpi title="Em andamento" value={active} icon={<AlertTriangle size={20} />} tone="red" />
          <Kpi title="Duração média" value={averageDuration === null ? '—' : formatMinutes(averageDuration)} icon={<Clock3 size={20} />} tone="cyan" />
          <Kpi title="Dono avisado" value={escalated} icon={<PhoneCall size={20} />} tone="orange" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="rounded-xl border border-[#252b40] bg-[#111827] p-4 print:border-slate-300 print:bg-white lg:col-span-2">
            <h2 className="mb-4 font-semibold">Ocorrências por freezer</h2>
            {byEquipment.length === 0 && <p className="text-sm text-slate-400">Nenhuma ocorrência no período.</p>}
            <div className="space-y-3">
              {byEquipment.map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm text-slate-300 print:text-slate-700">{name}</span>
                  <div className="h-5 flex-1 rounded bg-[#0d1421] print:bg-slate-100">
                    <div className="h-5 rounded bg-cyan-500/70" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-[#252b40] bg-[#111827] p-4 print:border-slate-300 print:bg-white">
            <h2 className="mb-4 font-semibold">Maior ocorrência</h2>
            <p className="text-4xl font-bold text-amber-300 print:text-amber-700">{rows.length ? formatMinutes(longest) : '—'}</p>
            <p className="mt-2 text-sm text-slate-400 print:text-slate-600">Maior tempo seguido fora do limite no período.</p>
          </section>
        </div>

        <section className="overflow-x-auto rounded-xl border border-[#252b40] bg-[#111827] print:border-slate-300 print:bg-white">
          <div className="border-b border-[#252b40] px-4 py-3 print:border-slate-300">
            <h2 className="font-semibold">Registro para auditoria ({rows.length})</h2>
          </div>
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-400 print:text-slate-600">
              <tr>
                {['Data', 'Equipamento', 'Tipo', 'Início — fim', 'Duração', 'Encerrado por', 'Dono avisado', 'Situação'].map((head) => (
                  <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252b40] print:divide-slate-200">
              {rows.map((item) => (
                <tr key={`${item.id}-${item.date}-${item.start}`}>
                  <td className="px-4 py-3 whitespace-nowrap">{item.date}</td>
                  <td className="px-4 py-3 font-semibold">{item.equipment}</td>
                  <td className="px-4 py-3">{TYPE_LABEL[item.type]}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.start} — {item.end ?? 'em andamento'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{item.duration}</td>
                  <td className="px-4 py-3">{item.resolvedBy ?? (item.status === 'resolved' ? 'Sensor normalizou' : '—')}</td>
                  <td className="px-4 py-3">{item.escalatedAt ? `às ${item.escalatedAt}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={item.status === 'resolved' ? 'text-emerald-400 print:text-emerald-700' : 'text-red-400 print:text-red-700'}>
                      {item.status === 'resolved' ? 'Resolvido' : 'Em andamento'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="p-10 text-center text-sm text-slate-400">Nenhuma ocorrência no período.</div>}
        </section>

        <p className="text-xs text-slate-500">
          GELAR Demo — dados simulados para apresentação. No piloto, o relatório diário chega ao fechamento do bar, e o semanal e o mensal ao dono.
        </p>
      </div>
    </main>
  );
}

function Kpi({ title, value, icon, tone }: {
  title: string; value: number | string; icon: ReactNode; tone: 'cyan' | 'green' | 'red' | 'orange';
}) {
  const colors = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    green: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };
  return (
    <div className="rounded-xl border border-[#252b40] bg-[#111827] p-4 print:border-slate-300 print:bg-white">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-400 print:text-slate-600">{title}</p>
        <div className={`rounded-lg p-2 ${colors[tone]}`}>{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}
