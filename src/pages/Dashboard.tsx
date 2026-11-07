
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
} from 'lucide-react';

import { SummaryCard } from '../components/dashboard/SummaryCard';
import { EquipmentCard } from '../components/dashboard/EquipmentCard';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { equipmentList } from '../data/equipment';

export default function Dashboard() {
  const normal = equipmentList.filter((item) => item.status === 'normal').length;
  const attention = equipmentList.filter((item) => item.status === 'attention').length;
  const critical = equipmentList.filter((item) => item.status === 'critical').length;
  const offline = equipmentList.filter((item) => item.status === 'offline').length;

  return (

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Visão geral</p>
            <h1 className="mt-1 text-2xl font-bold">Dashboard</h1>
            <p className="mt-2 text-sm text-slate-500">
              Acompanhe a situação dos equipamentos em tempo real.
            </p>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-300">
            <span className="font-semibold">MODO DEMONSTRAÇÃO</span>
            <p className="mt-1 text-amber-400/70">Dados simulados</p>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <SummaryCard
            title="Total de equipamentos"
            value={equipmentList.length}
            description="Equipamentos cadastrados"
            icon={Thermometer}
            color="bg-cyan-500/10 text-cyan-400"
          />

          <SummaryCard
            title="Operação normal"
            value={normal}
            description="Funcionamento normal"
            icon={CheckCircle2}
            color="bg-emerald-500/10 text-emerald-400"
          />

          <SummaryCard
            title="Em atenção"
            value={attention}
            description="Precisam de verificação"
            icon={Activity}
            color="bg-amber-500/10 text-amber-400"
          />

          <SummaryCard
            title="Situações críticas"
            value={critical + offline}
            description={`${critical} críticos · ${offline} sem comunicação`}
            icon={AlertTriangle}
            color="bg-red-500/10 text-red-400"
          />
        </section>

        <section className="mb-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Equipamentos</h2>
              <p className="mt-1 text-sm text-slate-500">
                Situação individual dos equipamentos monitorados
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {equipmentList.length} equipamentos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {equipmentList.map((equipment) => (
              <EquipmentCard key={equipment.id} equipment={equipment} />
            ))}
          </div>
        </section>

        <RecentAlerts />

        <footer className="mt-8 border-t border-slate-800 pt-5 text-center text-xs text-slate-600">
          GELAR — Gestão de Energia, Alertas e Refrigeração
        </footer>
      </main>
  );
}
