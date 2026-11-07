
import { useState } from 'react';

import {
  LayoutDashboard,
  Refrigerator,
  Bell,
  History,
  BarChart3,
  Settings,
  Snowflake,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react';

import { NavLink } from 'react-router';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', end: true },
  { label: 'Equipamentos', icon: Refrigerator, path: '/equipamentos' },
  { label: 'Alertas', icon: Bell, path: '/alertas' },
  { label: 'Histórico', icon: History, path: '/historico' },
  { label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
  { label: 'Monitor', icon: Monitor, path: '/monitor' },
  { label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <aside
      className={`flex w-full shrink-0 flex-col border-b border-slate-800
        bg-[#0d1421] text-white transition-all duration-300
        md:min-h-screen md:border-b-0 md:border-r
        ${collapsed ? 'md:w-20' : 'md:w-60 xl:w-64'}
      `}
    >
      {/* CABEÇALHO MOBILE */}
      <div className="flex items-center justify-between p-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-2">
            <Snowflake className="text-cyan-400" size={25} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wider">GELAR</h1>
            <p className="text-xs text-slate-400">
              Monitoramento inteligente
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800"
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* SIDEBAR DESKTOP */}
      <div className="hidden items-center justify-between gap-2 p-4 md:flex">
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2">
              <Snowflake className="text-cyan-400" size={25} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-wider">
                GELAR
              </h1>
              <p className="text-[10px] text-slate-400">
                Monitoramento inteligente
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          {collapsed ? (
            <PanelLeftOpen size={21} />
          ) : (
            <PanelLeftClose size={21} />
          )}
        </button>
      </div>

      {/* CONTEÚDO DO MENU */}
      <div
        className={`
          flex-1 px-3 pb-4 md:flex md:flex-col md:pt-4
          ${mobileOpen ? 'block' : 'hidden'}
        `}
      >
        {!collapsed && (
          <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu principal
          </p>
        )}

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg py-3 text-sm
                   transition-colors
                   ${collapsed
                     ? 'md:justify-center md:px-2'
                     : 'gap-3 px-3'
                   }
                   ${
                     isActive
                       ? 'bg-cyan-500/10 font-semibold text-cyan-400'
                       : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                   }`
                }
              >
                <Icon size={20} className="shrink-0" />

                <span className={collapsed ? 'md:hidden' : ''}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* RODAPÉ */}
        {!collapsed && (
          <div className="mt-6 hidden rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:mt-auto md:block">
            <p className="text-sm font-medium text-slate-200">
              GELAR Demo
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Dados simulados para apresentação
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
