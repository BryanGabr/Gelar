
import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Menu,
  X,
  CalendarDays,
  Clock3,
  DoorOpen,
  Volume2,
  VolumeX,
  Maximize2,
  Snowflake,
  Radio,
  ZapOff,
  PhoneCall,
} from 'lucide-react';

import { Link } from 'react-router';
import {
  escalationSeconds,
  upsertOccurrence,
  formatClock,
  formatDate,
  formatElapsed,
} from '../data/ocorrencias';

type Freezer = {
  id: number;
  name: string;
  temperature: number;
  limit: number;
  status: 'normal' | 'alert';
  issue?: 'temperature' | 'power' | 'door';
  alertStartedAt?: number;
  assignedTo?: string;
  assignedAt?: number;
  escalatedAt?: number;
  occurrenceId?: number;
};

const ESCALATION_SECONDS = escalationSeconds();

// Para a demo: /?recupera=30 faz o problema "se resolver sozinho" depois de 30 s, como se o sensor normalizasse.
function autoRecoverSeconds(): number {
  try {
    const value = Number(new URLSearchParams(window.location.search).get('recupera'));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}
const AUTO_RECOVER_SECONDS = autoRecoverSeconds();
const AUTO_RESOLVED_BY = 'Automático (sensor normalizou)';

// Instrução curta: diz o que fazer, não só o que aconteceu.
function instructionFor(item: Freezer) {
  if (item.issue === 'door') return 'Fechar a porta e conferir a vedação.';
  if (item.issue === 'power') return 'Verificar disjuntor e tomada. Se não voltar, avisar o dono.';
  return 'Conferir porta e vedação. Não abrir até normalizar.';
}

function describeIssue(item: Freezer) {
  if (item.issue === 'door') return 'Porta aberta além do limite';
  if (item.issue === 'power') return 'Sem energia no equipamento';
  return 'Temperatura acima do limite';
}

const initialFreezers: Freezer[] = [
  { id: 1, name: 'Freezer 1', temperature: -5.5, limit: -4, status: 'normal' },
  { id: 2, name: 'Freezer 2', temperature: -5.2, limit: -4, status: 'normal' },
  { id: 3, name: 'Freezer 3', temperature: -5.3, limit: -4, status: 'normal' },
  { id: 4, name: 'Freezer 4', temperature: -5.1, limit: -4, status: 'normal' },
  { id: 5, name: 'Freezer 5', temperature: -5.6, limit: -4, status: 'normal' },
  { id: 6, name: 'Freezer 6', temperature: -5.1, limit: -4, status: 'normal' },
  { id: 7, name: 'Freezer 7', temperature: -5.4, limit: -4, status: 'normal' },
  { id: 8, name: 'Freezer 8', temperature: -5.0, limit: -4, status: 'normal' },
];

function formatTemperature(value: number) {
  return `${value.toFixed(1).replace('.', ',')} °C`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining === 0
    ? `${hours}h`
    : `${hours}h ${remaining}min`;
}

export default function Monitor() {
  const [now, setNow] = useState(() => new Date());
  const [freezers, setFreezers] = useState(initialFreezers);
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastResolved, setLastResolved] = useState<string | null>(null);
  const nextOccurrenceId = useRef(Date.now());
  const audioRef = useRef<AudioContext | null>(null);
  const [radioEnabled, setRadioEnabled] = useState(false);
  const [radioTransmitting, setRadioTransmitting] = useState(false);
  const [radioMessage, setRadioMessage] = useState('Aguardando alertas para transmissão.');
  const radioEnabledRef = useRef(false);
  const announcedAlertsRef = useRef<Set<string>>(new Set());
  const transmissionIdRef = useRef(0);
  const doorOpen = freezers.some((item) => item.issue === 'door');
  const doorAlert = freezers.some((item) =>
    item.issue === 'door' && item.alertStartedAt !== undefined &&
    now.getTime() - item.alertStartedAt > 60000
  );
  const hasAlarm = freezers.some((item) =>
    item.status === 'alert' && (item.issue !== 'door' || doorAlert)
  );

  // O som só começa após o clique na simulação, respeitando o navegador.
  useEffect(() => {
    if (!hasAlarm || muted) return;
    const beep = () => {
      const ctx = audioRef.current;
      if (!ctx || ctx.state !== 'running') return;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'square';
      oscillator.frequency.value = 760;
      gain.gain.value = 0.045;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.18);
    };
    beep();
    const timer = window.setInterval(beep, 1200);
    return () => window.clearInterval(timer);
  }, [hasAlarm, muted]);

  useEffect(() => () => {
    void audioRef.current?.close();
    window.speechSynthesis?.cancel();
  }, []);

  const simulateDoor = () => {
    enableAudio();
    activateRadio();
    setFreezers((previous) => previous.map((item) =>
      item.id === 2
        ? { ...item, status: 'normal', issue: 'door', alertStartedAt: Date.now(), assignedTo: undefined, assignedAt: undefined, escalatedAt: undefined, occurrenceId: ++nextOccurrenceId.current }
        : item
    ));
  };

  const closeDoor = () => finish([2]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const alerts = freezers.filter((item) =>
    item.status === 'alert' ||
    (item.issue === 'door' && item.alertStartedAt !== undefined &&
      now.getTime() - item.alertStartedAt > 60000)
  );
  const pendingDoors = freezers.filter((item) =>
    item.issue === 'door' && item.alertStartedAt !== undefined &&
    now.getTime() - item.alertStartedAt <= 60000
  );
  const normal = freezers.length - alerts.length - pendingDoors.length;

  const mainAlert =
    alerts.find((item) => item.issue === 'door') ??
    alerts.find((item) => item.issue === 'temperature') ?? alerts[0];

  const alertMinutes = (item: Freezer) =>
    item.alertStartedAt
      ? Math.max(
          0,
          Math.floor((now.getTime() - item.alertStartedAt) / 60000),
        )
      : 0;

  const alertSeconds = (item: Freezer) =>
    item.alertStartedAt ? Math.max(0, Math.floor((now.getTime() - item.alertStartedAt) / 1000)) : 0;

  // Grava ou atualiza a ocorrência no registro compartilhado com o Histórico.
  const record = (item: Freezer, patch: { status?: 'active' | 'resolved'; resolvedBy?: string; endedAt?: number }) => {
    if (!item.occurrenceId || !item.alertStartedAt || !item.issue) return;
    const endedAt = patch.endedAt;
    upsertOccurrence({
      id: item.occurrenceId,
      equipment: item.name,
      type: item.issue,
      description: describeIssue(item),
      temperature: item.temperature,
      date: formatDate(item.alertStartedAt),
      start: formatClock(item.alertStartedAt),
      end: endedAt ? formatClock(endedAt) : null,
      duration: formatElapsed(((endedAt ?? now.getTime()) - item.alertStartedAt) / 1000),
      status: patch.status ?? 'active',
      assignedTo: item.assignedTo,
      assignedAt: item.assignedAt ? formatClock(item.assignedAt) : undefined,
      resolvedBy: patch.resolvedBy,
      escalatedAt: item.escalatedAt ? formatClock(item.escalatedAt) : undefined,
      responseSeconds: item.assignedAt ? Math.floor((item.assignedAt - item.alertStartedAt) / 1000) : undefined,
    });
  };

  const isAlertItem = (item: Freezer) =>
    item.status === 'alert' ||
    (item.issue === 'door' && item.alertStartedAt !== undefined && now.getTime() - item.alertStartedAt > 60000);

  // O alerta sai sozinho quando o sensor volta ao normal: registra a ocorrência como resolvida
  // e limpa o freezer. Porta fechada antes de 1 minuto nem chega a virar ocorrência.
  const finish = (ids: number[]) => {
    const at = Date.now();
    const closed = freezers.filter((item) => ids.includes(item.id) && item.issue);
    const alertedNames = closed.filter(isAlertItem).map((item) => item.name);
    setFreezers((previous) =>
      previous.map((item) => {
        if (!ids.includes(item.id) || !item.issue) return item;
        if (isAlertItem(item)) record(item, { status: 'resolved', resolvedBy: AUTO_RESOLVED_BY, endedAt: at });
        return {
          ...item,
          temperature: -5.2,
          status: 'normal',
          issue: undefined,
          alertStartedAt: undefined,
          assignedTo: undefined,
          assignedAt: undefined,
          escalatedAt: undefined,
          occurrenceId: undefined,
        };
      }),
    );
    if (alertedNames.length > 0) {
      setLastResolved(`${alertedNames.join(', ')} voltou ao normal às ${formatClock(at)}. Registrado no histórico.`);
    }
  };

  const date = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now);

  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  const enableAudio = () => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    void audioRef.current.resume();
    setMuted(false);
  };

  const simulate = (id: number, issue: 'temperature' | 'power') => {
    enableAudio();
    activateRadio();
    setLastResolved(null);
    const startedAt = Date.now();
    const occurrenceId = ++nextOccurrenceId.current;
    setFreezers((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item;
        const updated: Freezer = {
          ...item,
          temperature: issue === 'temperature' ? -0.8 : -0.5,
          status: 'alert',
          issue,
          alertStartedAt: startedAt,
          assignedTo: undefined,
          assignedAt: undefined,
          escalatedAt: undefined,
          occurrenceId,
        };
        record(updated, { status: 'active' });
        return updated;
      }),
    );
  };

  const normalize = () => {
    setMuted(false);
    stopRadioTransmission();
    finish(freezers.map((item) => item.id));
  };

  const activateRadio = () => {
    radioEnabledRef.current = true;
    setRadioEnabled(true);
  };

  const stopRadioTransmission = () => {
    transmissionIdRef.current += 1;
    window.speechSynthesis?.cancel();
    setRadioTransmitting(false);
    setRadioMessage('Aguardando alertas para transmissão.');
  };

  const buildRadioMessage = (item: Freezer) => {
    if (item.issue === 'door')
      return `${item.name}, porta aberta. ${instructionFor(item)}`;
    if (item.issue === 'power')
      return `${item.name} sem energia. ${instructionFor(item)}`;
    return `${item.name}, temperatura subindo. ${instructionFor(item)}`;
  };

  const transmitRadio = (message: string) => {
    activateRadio();
    const id = ++transmissionIdRef.current;
    window.speechSynthesis?.cancel();
    setRadioMessage(message);
    setRadioTransmitting(true);

    if (!('speechSynthesis' in window)) {
      setRadioTransmitting(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.onend = () => {
      if (transmissionIdRef.current === id) setRadioTransmitting(false);
    };
    utterance.onerror = () => {
      if (transmissionIdRef.current === id) setRadioTransmitting(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  // A cada novo alerta ativo, transmite uma única vez. Ao resolver, libera novo aviso.
  const activeAlertKeys = alerts.map((item) => `${item.id}:${item.issue}`).join('|');
  useEffect(() => {
    const keys = new Set(alerts.map((item) => `${item.id}:${item.issue}`));
    for (const oldKey of announcedAlertsRef.current) {
      if (!keys.has(oldKey)) announcedAlertsRef.current.delete(oldKey);
    }
    if (!radioEnabledRef.current) return;
    const next = alerts.find((item) => !announcedAlertsRef.current.has(`${item.id}:${item.issue}`));
    if (next) {
      announcedAlertsRef.current.add(`${next.id}:${next.issue}`);
      transmitRadio(buildRadioMessage(next));
    }
    if (alerts.length === 0) stopRadioTransmission();
    // activeAlertKeys representa alterações de alertas, não o relógio de cada segundo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAlertKeys, radioEnabled]);

  // Escalonamento: alerta vermelho que não normaliza em ESCALATION_SECONDS avisa o dono.
  // No piloto, isto vira uma ligação ou mensagem real (ex.: API de voz/WhatsApp); aqui é simulado.
  useEffect(() => {
    const due = alerts.filter(
      (item) => !item.escalatedAt && alertSeconds(item) >= ESCALATION_SECONDS,
    );
    if (due.length === 0) return;
    const at = Date.now();
    setFreezers((previous) =>
      previous.map((item) => {
        if (!due.some((d) => d.id === item.id)) return item;
        const updated = { ...item, escalatedAt: at };
        record(updated, { status: 'active' });
        return updated;
      }),
    );
    transmitRadio(`${due[0].name} continua em alerta. Ligando para o dono.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  // Demo: com ?recupera=SEGUNDOS, o problema se resolve sozinho, como se o sensor normalizasse.
  useEffect(() => {
    if (!AUTO_RECOVER_SECONDS) return;
    const due = alerts.filter((item) => alertSeconds(item) >= AUTO_RECOVER_SECONDS).map((item) => item.id);
    if (due.length > 0) finish(due);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const escalated = alerts.filter((item) => item.escalatedAt);

  const fullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] p-3 text-white lg:p-4">
      <div className="mx-auto w-full max-w-[1500px]">

        {/* CABEÇALHO */}
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              title={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="monitor-navigation"
              className="flex items-center justify-center rounded-lg border border-slate-700 bg-[#1b2230] p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="rounded-xl bg-violet-600 p-2">
              <Snowflake size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">GELAR</h1>
              <p className="text-xs text-slate-400">Pôr do Sol • Refrigeração</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="flex items-center gap-2 rounded-lg bg-[#1b2230] px-3 py-2 text-xs text-slate-200">
              <CalendarDays size={16} />
              <span className="capitalize">{date}</span>
            </div>

            <div
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                alerts.length > 0
                  ? 'bg-red-950 text-red-400'
                  : 'bg-emerald-950 text-emerald-400'
              }`}
            >
              {normal} normais · {alerts.length} em alerta{pendingDoors.length > 0 ? ` · ${pendingDoors.length} porta aberta` : ''}
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-xl font-bold">
                <Clock3 size={17} />
                {time}
              </div>
              <p className="text-[10px] text-slate-400">
                Relógio do monitor
              </p>
            </div>

            <button
              onClick={fullscreen}
              title="Alternar tela cheia"
              aria-label="Alternar tela cheia"
              className="rounded-lg bg-[#1b2230] p-2 hover:bg-[#293244]"
            >
              <Maximize2 size={18} />
            </button>

          </div>
        </header>

        {/* MENU DE NAVEGAÇÃO — O MONITOR É A PÁGINA INICIAL */}
        {menuOpen && (
          <nav
            id="monitor-navigation"
            aria-label="Navegação principal"
            className="mb-3 flex flex-wrap gap-2 rounded-xl border border-slate-700 bg-[#111827] p-3"
          >
            {[
              { label: 'Monitor', path: '/' },
              { label: 'Equipamentos', path: '/equipamentos' },
              { label: 'Alertas', path: '/alertas' },
              { label: 'Histórico', path: '/historico' },
              { label: 'Relatórios', path: '/relatorios' },
              { label: 'Configurações', path: '/configuracoes' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                aria-current={item.path === '/' ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  item.path === '/'
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'bg-[#1b2230] text-slate-200 hover:bg-slate-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* PORTA ABERTA: AVISO ANTES DE 1 MINUTO */}
        {pendingDoors.length > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-500 bg-amber-950 p-3 text-amber-200">
            <DoorOpen size={24} />
            <p className="text-sm font-semibold">{pendingDoors[0].name}: porta aberta — aguardando 1 minuto para disparar o alarme.</p>
          </div>
        )}

        {/* ALERTA PRINCIPAL */}
        {mainAlert ? (
          <div
            role="alert"
            className="mb-3 flex items-center gap-3 rounded-xl border border-red-500 bg-red-600 p-3"
          >
            <AlertTriangle
              className="shrink-0"
              size={30}
            />

            <div>
              <h2 className="text-base font-bold lg:text-xl">
                {mainAlert.name}:{' '}
                {mainAlert.issue === 'door'
                  ? 'Porta aberta — verifique o equipamento'
                  : mainAlert.issue === 'power'
                  ? 'Sem energia no equipamento'
                  : `Acima do limite há ${formatDuration(
                      alertMinutes(mainAlert),
                    )}`}
                {alerts.length > 1 &&
                  ` (+${alerts.length - 1} alerta)`}
              </h2>

              <p className="mt-1 text-sm font-semibold lg:text-base">{instructionFor(mainAlert)}</p>
              <p className="mt-1 text-xs text-red-100">
                {mainAlert.escalatedAt
                  ? `Dono avisado às ${formatClock(mainAlert.escalatedAt)}`
                  : `Equipe avisada no fone · se não normalizar, o dono é avisado em ${formatElapsed(Math.max(0, ESCALATION_SECONDS - alertSeconds(mainAlert)))}`}
              </p>
            </div>

          </div>
        ) : (
          <div className="mb-3 rounded-xl bg-emerald-900 p-3 text-base font-bold">
            {pendingDoors.length > 0
              ? 'Nenhum alerta crítico. Há porta aberta em observação.'
              : lastResolved ?? 'Todos os equipamentos estão normais.'}
          </div>
        )}

        {/* ESCALONAMENTO AO DONO */}
        {escalated.length > 0 && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-orange-400 bg-orange-950 p-3 text-orange-100">
            <PhoneCall size={24} className="animate-pulse text-orange-300" />
            <p className="text-sm font-semibold">
              Dono avisado por ligação às {formatClock(escalated[0].escalatedAt ?? now.getTime())}: {escalated[0].name} sem normalizar há {formatElapsed(alertSeconds(escalated[0]))}.
              {escalated.length > 1 ? ` (+${escalated.length - 1})` : ''}
            </p>
          </div>
        )}

        {/* COMUNICAÇÃO VIA RÁDIO — SOMENTE SIMULAÇÃO */}
        <section className={`mb-3 rounded-xl border p-3 ${radioTransmitting ? 'border-red-500 bg-red-950/50' : 'border-violet-700 bg-[#141827]'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Radio className={radioTransmitting ? 'text-red-400 animate-pulse' : 'text-violet-400'} size={26} />
              <div>
                <h2 className="font-bold text-sm lg:text-base">Comunicação via rádio <span className="text-xs font-normal text-slate-400">(simulação)</span></h2>
                <p className="text-xs text-slate-300" aria-live="polite">{radioTransmitting ? 'Transmitindo mensagem de voz...' : radioEnabled ? 'Rádio virtual ativado' : 'Rádio virtual aguardando ativação'}</p>
                <p className="mt-1 text-xs text-slate-400">{radioMessage}</p>
              </div>
            </div>
            <button
              onClick={() => transmitRadio(mainAlert ? buildRadioMessage(mainAlert) : 'Teste de comunicação GELAR. Rádio virtual funcionando corretamente.')}
              className="rounded-md bg-violet-700 px-3 py-2 text-xs font-semibold hover:bg-violet-600"
            >
              Testar comunicação por rádio
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">Áudio reproduzido pelo navegador. Nenhuma transmissão real por radiofrequência.</p>
        </section>

        {/* CARDS DOS FREEZERS */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {freezers.map((freezer) => {
            const isAlert = freezer.status === 'alert' ||
              (freezer.issue === 'door' && freezer.alertStartedAt !== undefined &&
                now.getTime() - freezer.alertStartedAt > 60000);
            const isDoorPending = freezer.issue === 'door' && !isAlert;

            return (
              <article
                key={freezer.id}
                className={`rounded-xl border p-3 ${
                  isAlert
                    ? 'border-red-500 bg-[#351417]'
                    : isDoorPending ? 'border-amber-500 bg-[#302517]' : 'border-[#252b40] bg-[#111827]'
                }`}
              >

                {/* Nome e status */}
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold">
                    {freezer.name}
                  </h3>

                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      isAlert
                        ? 'bg-red-950 text-red-400'
                        : isDoorPending ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
                    }`}
                  >
                    {isAlert ? 'Alerta' : isDoorPending ? 'Porta aberta' : 'Normal'}
                  </span>
                </div>

                {/* Temperatura */}
                <div
                  className={`mb-3 text-3xl font-bold tracking-tight xl:text-4xl ${
                    isAlert ? 'text-red-400' : isDoorPending ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {formatTemperature(freezer.temperature)}
                </div>

                {/* Barra visual de status */}
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-700/60">
                  <div
                    className={`h-full rounded-full ${
                      isAlert
                        ? 'bg-red-400'
                        : isDoorPending ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{
                      width: isAlert ? '100%' : '42%',
                    }}
                  />
                </div>

                {/* Informação do equipamento */}
                <div className="min-h-6 text-xs lg:text-sm">

                  {freezer.issue === 'door' ? (
                    <p className={`flex items-center gap-1 font-semibold ${isAlert ? 'text-red-300' : 'text-amber-300'}`}>
                      <DoorOpen size={14} /> Porta aberta há {Math.floor((now.getTime() - (freezer.alertStartedAt ?? now.getTime())) / 1000)}s
                    </p>
                  ) : freezer.issue === 'power' ? (
                    <p className="flex items-center gap-1 font-semibold text-red-300">
                      <ZapOff size={14} />
                      Sem energia no equipamento
                    </p>
                  ) : freezer.issue === 'temperature' ? (
                    <p className="font-semibold text-red-300">
                      Acima do limite há{' '}
                      {formatDuration(alertMinutes(freezer))}
                    </p>
                  ) : (
                    <p className="text-slate-400">
                      Limite: até{' '}
                      {formatTemperature(freezer.limit)}
                    </p>
                  )}

                  {isAlert && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {freezer.escalatedAt && (
                        <span className="flex items-center gap-1 rounded-full bg-orange-900 px-2 py-1 text-[11px] font-semibold text-orange-200">
                          <PhoneCall size={12} /> Dono avisado
                        </span>
                      )}
                    </div>
                  )}

                </div>
              </article>
            );
          })}

        </section>

        {/* CONTROLES DE SIMULAÇÃO */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-3">

          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
            Simulação
          </span>

          <button
            onClick={() => simulate(3, 'temperature')}
            className="rounded-md bg-[#222b3a] px-3 py-1.5 text-xs hover:bg-[#303c50]"
          >
            Temperatura alta
          </button>

          <button
            onClick={() => simulate(6, 'power')}
            className="rounded-md bg-[#222b3a] px-3 py-1.5 text-xs hover:bg-[#303c50]"
          >
            Falta de energia
          </button>

          <button
            onClick={simulateDoor}
            className="rounded-md bg-[#222b3a] px-3 py-1.5 text-xs hover:bg-[#303c50]"
          >
            Simular porta aberta
          </button>

          {doorOpen && (
            <>
              <button onClick={closeDoor} className="rounded-md bg-emerald-800 px-3 py-1.5 text-xs hover:bg-emerald-700">
                Fechar porta
              </button>

            </>
          )}

          {hasAlarm && (
            <button onClick={() => { enableAudio(); setMuted(!muted); }} className="flex items-center gap-1 rounded-md bg-[#222b3a] px-3 py-1.5 text-xs hover:bg-[#303c50]">
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {muted ? 'Ativar som' : 'Silenciar alarme'}
            </button>
          )}

          <button
            onClick={normalize}
            className="rounded-md bg-emerald-800 px-3 py-1.5 text-xs hover:bg-emerald-700"
          >
            Sensores voltam ao normal
          </button>

          <span className="text-[10px] text-slate-500">
            Protótipo demonstrativo — dados simulados
          </span>

        </div>
      </div>
    </div>
  );
}
