
import { useMemo, useState } from 'react';
import {
  Search,
  Thermometer,
  Refrigerator,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from 'lucide-react';

import { equipmentList } from '../data/equipment';
import type { EquipmentStatus } from '../data/equipment';
import { EquipmentCard } from '../components/dashboard/EquipmentCard';

type FilterStatus = 'all' | EquipmentStatus;

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Normal', value: 'normal' },
  { label: 'Atenção', value: 'attention' },
  { label: 'Crítico', value: 'critical' },
  { label: 'Sem comunicação', value: 'offline' },
];

export default function Equipamentos() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((equipment) => {
      const matchesSearch = equipment.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || equipment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const counts = {
    total: equipmentList.length,
    normal: equipmentList.filter((e) => e.status === 'normal').length,
    attention: equipmentList.filter((e) => e.status === 'attention').length,
    critical: equipmentList.filter((e) => e.status === 'critical').length,
    offline: equipmentList.filter((e) => e.status === 'offline').length,
  };

  return (
    <main className="min-w-0 p-4 text-white sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="text-sm text-slate-400">Monitoramento</p>
        <h1 className="mt-1 text-2xl font-bold">Equipamentos</h1>
        <p className="mt-2 text-sm text-slate-500">
          Consulte a situação e a temperatura dos equipamentos.
        </p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-[#111b2b] p-4">
          <Thermometer className="mb-3 text-cyan-400" size={22} />
          <p className="text-2xl font-bold">{counts.total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111b2b] p-4">
          <CheckCircle2 className="mb-3 text-emerald-400" size={22} />
          <p className="text-2xl font-bold">{counts.normal}</p>
          <p className="text-xs text-slate-400">Normais</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111b2b] p-4">
          <Activity className="mb-3 text-amber-400" size={22} />
          <p className="text-2xl font-bold">{counts.attention}</p>
          <p className="text-xs text-slate-400">Em atenção</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111b2b] p-4">
          <AlertTriangle className="mb-3 text-red-400" size={22} />
          <p className="text-2xl font-bold">{counts.critical}</p>
          <p className="text-xs text-slate-400">Críticos</p>
        </div>

        <div className="col-span-2 rounded-xl border border-slate-800 bg-[#111b2b] p-4 xl:col-span-1">
          <WifiOff className="mb-3 text-slate-400" size={22} />
          <p className="text-2xl font-bold">{counts.offline}</p>
          <p className="text-xs text-slate-400">Sem comunicação</p>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="mb-4 text-lg font-semibold">
            Equipamentos cadastrados
          </h2>

          <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={19}
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar equipamento..."
              className="w-full rounded-lg border border-slate-800 bg-[#111b2b] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'border border-slate-800 bg-[#111b2b] text-slate-400 hover:border-slate-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {filteredEquipment.length} equipamento(s) encontrado(s)
          </p>
        </div>

        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredEquipment.map((equipment) => (
              <EquipmentCard key={equipment.id} equipment={equipment} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-[#111b2b] p-10 text-center">
            <Refrigerator className="mx-auto mb-3 text-slate-500" size={32} />
            <p className="font-medium">Nenhum equipamento encontrado</p>
            <p className="mt-2 text-sm text-slate-500">
              Tente alterar a pesquisa ou o filtro selecionado.
            </p>
          </div>
        )}
      </section>

      <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
        Demonstração: os dados apresentados são simulados e não representam
        leituras reais dos sensores.
      </div>
    </main>
  );
}
