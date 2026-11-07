
import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  DoorOpen,
  Volume2,
  VolumeX,
  Maximize2,
  Snowflake,
  Radio,
  ZapOff,
} from 'lucide-react';

import { Link } from 'react-router';

type Freezer = {
  id: number;
  name: string;
  temperature: number;
  limit: number;
  status: 'normal' | 'alert';
  issue?: 'temperature' | 'power' | 'door';
  alertStartedAt?: number;
};

const initialFreezers: Freezer[] = [
  { id: 1, name: 'Freezer 1', temperature: -5.5, limit: -4, status: 'normal' },
  { id: 2, name: 'Freezer 2', temperature: -5.2, limit: -4, status: 'normal' },
  {
    id: 3,
    name: 'Freezer 3',
    temperature: -0.8,
    limit: -4,
    status: 'alert',
    issue: 'temperature',
    alertStartedAt: Date.now() - 401 * 60000,
  },
  { id: 4, name: 'Freezer 4', temperature: -5.1, limit: -4, status: 'normal' },
  { id: 5, name: 'Freezer 5', temperature: -5.6, limit: -4, status: 'normal' },
  {
    id: 6,
    name: 'Freezer 6',
    temperature: -0.5,
    limit: -4,
    status: 'alert',
    issue: 'power',
  },
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
      item.id === 2 ? { ...item, status: 'normal', issue: 'door', alertStartedAt: Date.now() } : item
    ));
  };

  const closeDoor = () => {
    setFreezers((previous) => previous.map((item) =>
      item.id === 2 && item.issue === 'door'
        ? { ...item, status: 'normal', issue: undefined, alertStartedAt: undefined }
        : item
    ));
  };

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
    setFreezers((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              temperature: issue === 'temperature' ? -0.8 : -0.5,
              status: 'alert',
              issue,
              alertStartedAt: Date.now(),
            }
          : item,
      ),
    );
  };

  const normalize = () => {
    setMuted(false);
    stopRadioTransmission();
    setFreezers((previous) =>
      previous.map((item) => ({
        ...item,
        temperature: -5.2,
        status: 'normal',
        issue: undefined,
        alertStartedAt: undefined,
      })),
    );
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
      return `Atenção! ${item.name} está com a porta aberta há mais de um minuto. Favor verificar.`;
    if (item.issue === 'power')
      return `Atenção! ${item.name} está sem energia elétrica. Favor verificar.`;
    return `Atenção! Temperatura crítica no ${item.name}. Favor verificar o equipamento.`;
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
            <Link
              to="/"
              title="Voltar ao Dashboard"
              aria-label="Voltar ao Dashboard"
              className="flex items-center justify-center rounded-lg border border-slate-700 bg-[#1b2230] p-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Link>

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

              <p className="mt-1 text-xs lg:text-sm">
                {mainAlert.issue === 'door'
                  ? 'Feche a porta para encerrar o alarme.'
                  : mainAlert.issue === 'power'
                  ? 'Verifique a alimentação elétrica.'
                  : 'Verifique a porta e a vedação do equipamento.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-3 rounded-xl bg-emerald-900 p-3 text-base font-bold">
            Todos os equipamentos estão normais.
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
            Normalizar tudo
          </button>

          <span className="text-[10px] text-slate-500">
            Protótipo demonstrativo — dados simulados
          </span>

        </div>
      </div>
    </div>
  );
}
