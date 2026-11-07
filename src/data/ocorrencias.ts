// Registro de ocorrências do GELAR.
// Protótipo: persiste no localStorage do navegador. No piloto, vira um backend.

export type OccurrenceType = 'temperature' | 'power' | 'door';

export type OccurrenceRecord = {
  id: number;
  equipment: string;
  type: OccurrenceType;
  description: string;
  temperature: number;
  date: string;
  start: string;
  end: string | null;
  duration: string;
  status: 'resolved' | 'active';
  assignedTo?: string;
  assignedAt?: string;
  resolvedBy?: string;
  escalatedAt?: string;
  responseSeconds?: number;
};

const STORAGE_KEY = 'gelar-ocorrencias';

// Ocorrências de exemplo (simuladas) para o histórico e os relatórios.
export const seedOccurrences: OccurrenceRecord[] = [
  { id: 1, equipment: 'Freezer 3', type: 'temperature', description: 'Temperatura acima do limite permitido', temperature: -0.8, date: '06/11/2026', start: '09:20', end: null, duration: '6h 41min', status: 'active' },
  { id: 2, equipment: 'Freezer 6', type: 'power', description: 'Possível interrupção de energia', temperature: -0.5, date: '06/11/2026', start: '14:35', end: null, duration: '1h 26min', status: 'active' },
  { id: 3, equipment: 'Freezer 2', type: 'temperature', description: 'Temperatura normalizada automaticamente', temperature: -5.2, date: '06/11/2026', start: '08:10', end: '08:42', duration: '32min', status: 'resolved' },
  { id: 4, equipment: 'Freezer 5', type: 'power', description: 'Alimentação elétrica restabelecida', temperature: -5.6, date: '05/11/2026', start: '18:42', end: '19:00', duration: '18min', status: 'resolved' },
  { id: 5, equipment: 'Freezer 1', type: 'temperature', description: 'Oscilação de temperatura detectada', temperature: -3.1, date: '04/11/2026', start: '11:15', end: '11:39', duration: '24min', status: 'resolved' },
  { id: 6, equipment: 'Freezer 4', type: 'power', description: 'Interrupção de energia detectada', temperature: -2.4, date: '03/11/2026', start: '16:20', end: '16:32', duration: '12min', status: 'resolved' },
];


export const TEAM = ['Ana', 'Bruno', 'Carla', 'Diego'];

// Tempo sem "assumir" até avisar o dono. Pode ser reduzido para a demo: /?escalacao=20
export function escalationSeconds(): number {
  try {
    const param = new URLSearchParams(window.location.search).get('escalacao');
    const value = param ? Number(param) : NaN;
    if (Number.isFinite(value) && value > 0) return value;
  } catch {
    // ignora
  }
  return 300;
}

export function loadOccurrences(): OccurrenceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OccurrenceRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveOccurrences(list: OccurrenceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // armazenamento indisponível: o protótipo segue sem persistir
  }
}

export function upsertOccurrence(record: OccurrenceRecord) {
  const list = loadOccurrences();
  const index = list.findIndex((item) => item.id === record.id);
  if (index >= 0) list[index] = record;
  else list.unshift(record);
  saveOccurrences(list);
}

export function formatClock(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(timestamp);
}

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(timestamp);
}

export function formatElapsed(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${String(minutes % 60).padStart(2, '0')}min`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
