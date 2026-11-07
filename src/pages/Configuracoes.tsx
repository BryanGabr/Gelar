
import { useState } from 'react';
import {
  Settings,
  Store,
  Thermometer,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';

type Config = {
  establishment: string;
  responsible: string;
  temperatureLimit: number;
  notifications: boolean;
  temperatureAlerts: boolean;
  powerAlerts: boolean;
  soundAlerts: boolean;
};

const defaultConfig: Config = {
  establishment: 'Pôr do Sol',
  responsible: 'Administrador',
  temperatureLimit: -4,
  notifications: true,
  temperatureAlerts: true,
  powerAlerts: true,
  soundAlerts: false,
};

const STORAGE_KEY = 'gelar-configuracoes';

function loadConfig(): Config {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return {
        ...defaultConfig,
        ...JSON.parse(saved),
      };
    }
  } catch {
    // Usa as configurações padrão.
  }

  return defaultConfig;
}

export default function Configuracoes() {
  const [config, setConfig] = useState<Config>(loadConfig);
  const [saved, setSaved] = useState(false);

  function updateConfig<K extends keyof Config>(
    key: K,
    value: Config[K]
  ) {
    setConfig((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  }

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSaved(true);
    } catch {
      alert('Não foi possível salvar as configurações.');
    }
  }

  function resetConfig() {
    setConfig({ ...defaultConfig });
    setSaved(false);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      alert('Não foi possível restaurar as configurações salvas.');
    }
  }

  return (
    <main className="min-h-screen bg-[#090d16] p-4 text-white lg:p-6">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* CABEÇALHO */}
        <div>
          <div className="flex items-center gap-3">
            <Settings size={27} className="text-cyan-400" />
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Personalize as preferências do sistema GELAR.
          </p>
        </div>

        {/* ESTABELECIMENTO */}
        <section className="rounded-xl border border-[#252b40] bg-[#111827] p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Store size={22} />
            </div>

            <div>
              <h2 className="font-bold">Estabelecimento</h2>
              <p className="text-xs text-slate-400">
                Informações gerais do local monitorado.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="establishment"
                className="mb-2 block text-sm text-slate-300"
              >
                Nome do estabelecimento
              </label>

              <input
                id="establishment"
                type="text"
                value={config.establishment}
                onChange={(event) =>
                  updateConfig('establishment', event.target.value)
                }
                className="w-full rounded-lg border border-[#293244] bg-[#0d1421] px-3 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label
                htmlFor="responsible"
                className="mb-2 block text-sm text-slate-300"
              >
                Responsável
              </label>

              <input
                id="responsible"
                type="text"
                value={config.responsible}
                onChange={(event) =>
                  updateConfig('responsible', event.target.value)
                }
                className="w-full rounded-lg border border-[#293244] bg-[#0d1421] px-3 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </section>

        {/* TEMPERATURA */}
        <section className="rounded-xl border border-[#252b40] bg-[#111827] p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Thermometer size={22} />
            </div>

            <div>
              <h2 className="font-bold">Monitoramento de temperatura</h2>
              <p className="text-xs text-slate-400">
                Defina o limite de temperatura para alertas.
              </p>
            </div>
          </div>

          <div className="max-w-sm">
            <label
              htmlFor="temperatureLimit"
              className="mb-2 block text-sm text-slate-300"
            >
              Temperatura máxima permitida (°C)
            </label>

            <div className="flex items-center gap-3">
              <input
                id="temperatureLimit"
                type="number"
                min={-30}
                max={20}
                step={0.5}
                value={config.temperatureLimit}
                onChange={(event) =>
                  updateConfig(
                    'temperatureLimit',
                    Number(event.target.value)
                  )
                }
                className="w-32 rounded-lg border border-[#293244] bg-[#0d1421] px-3 py-3 text-sm text-white outline-none focus:border-cyan-500"
              />

              <span className="text-sm text-slate-400">°C</span>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Valor demonstrativo. Exemplo: com limite de -4 °C,
              temperaturas acima desse valor representam alerta.
            </p>
          </div>
        </section>

        {/* NOTIFICAÇÕES */}
        <section className="rounded-xl border border-[#252b40] bg-[#111827] p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Bell size={22} />
            </div>

            <div>
              <h2 className="font-bold">Alertas e notificações</h2>
              <p className="text-xs text-slate-400">
                Escolha quais notificações deseja receber.
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#252b40]">
            <ToggleRow
              title="Ativar notificações"
              description="Habilitar notificações do sistema."
              checked={config.notifications}
              onChange={(value) =>
                updateConfig('notifications', value)
              }
            />

            <ToggleRow
              title="Alertas de temperatura"
              description="Notificar quando a temperatura ultrapassar o limite."
              checked={config.temperatureAlerts}
              disabled={!config.notifications}
              onChange={(value) =>
                updateConfig('temperatureAlerts', value)
              }
            />

            <ToggleRow
              title="Alertas de energia"
              description="Notificar possíveis interrupções de energia."
              checked={config.powerAlerts}
              disabled={!config.notifications}
              onChange={(value) =>
                updateConfig('powerAlerts', value)
              }
            />

            <ToggleRow
              title="Alertas sonoros"
              description="Preferência para avisos sonoros no sistema."
              checked={config.soundAlerts}
              disabled={!config.notifications}
              onChange={(value) =>
                updateConfig('soundAlerts', value)
              }
            />
          </div>
        </section>

        {/* INFORMAÇÕES */}
        <div className="flex items-start gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <Info size={19} className="mt-0.5 shrink-0 text-cyan-400" />

          <div>
            <p className="text-sm font-semibold text-cyan-300">
              Modo demonstração
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              As configurações são salvas somente neste navegador.
              Por enquanto, não alteram os dados do Monitor, os sensores,
              os limites reais nem enviam notificações.
            </p>
          </div>
        </div>

        {/* BOTÕES */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#252b40] pt-5">
          <button
            type="button"
            onClick={resetConfig}
            className="flex items-center gap-2 rounded-lg border border-[#293244] bg-[#151d2b] px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            <RotateCcw size={17} />
            Restaurar padrões
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {saved && (
              <span
                role="status"
                className="flex items-center gap-2 text-sm text-emerald-400"
              >
                <CheckCircle2 size={17} />
                Configurações salvas
              </span>
            )}

            <button
              type="button"
              onClick={saveConfig}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500"
            >
              <Save size={17} />
              Salvar configurações
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          GELAR Demo — configurações demonstrativas.
        </p>
      </div>
    </main>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-slate-200">
          {title}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? 'bg-cyan-500' : 'bg-slate-700'
        } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
