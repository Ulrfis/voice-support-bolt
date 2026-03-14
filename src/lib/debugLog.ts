export type LogDirection = 'out' | 'in' | 'system' | 'error';
export type LogCategory = 'sdk-call' | 'sdk-event' | 'ws' | 'console' | 'lifecycle';

export interface DebugLogEntry {
  id: number;
  timestamp: number;
  timeStr: string;
  direction: LogDirection;
  category: LogCategory;
  label: string;
  detail: string;
  raw?: unknown;
}

type Listener = (entry: DebugLogEntry) => void;

let _counter = 0;
const _listeners: Set<Listener> = new Set();
const _buffer: DebugLogEntry[] = [];
const MAX_BUFFER = 2000;

function makeTimeStr(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

function serialize(val: unknown): string {
  if (val === undefined) return '';
  if (typeof val === 'string') return val;
  if (val instanceof Error) return `${val.name}: ${val.message}`;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

export function pushLog(
  direction: LogDirection,
  category: LogCategory,
  label: string,
  detail?: unknown,
): void {
  const entry: DebugLogEntry = {
    id: ++_counter,
    timestamp: Date.now(),
    timeStr: makeTimeStr(),
    direction,
    category,
    label,
    detail: serialize(detail),
    raw: detail,
  };
  _buffer.push(entry);
  if (_buffer.length > MAX_BUFFER) _buffer.splice(0, _buffer.length - MAX_BUFFER);
  _listeners.forEach(fn => fn(entry));
}

export function subscribeDebugLog(fn: Listener): () => void {
  _listeners.add(fn);
  return () => { _listeners.delete(fn); };
}

export function getDebugBuffer(): DebugLogEntry[] {
  return _buffer.slice();
}

export function clearDebugBuffer(): void {
  _buffer.length = 0;
}

export function exportLogsAsText(): string {
  return _buffer.map(e => {
    const dir = e.direction === 'out' ? '>>' : e.direction === 'in' ? '<<' : e.direction === 'error' ? '!!' : '--';
    const detail = e.detail ? ` | ${e.detail}` : '';
    return `${e.timeStr} [${dir}] [${e.category}] ${e.label}${detail}`;
  }).join('\n');
}

export function installConsoleCapture(): () => void {
  const levels = ['log', 'warn', 'error', 'info', 'debug'] as const;
  const originals: Partial<Record<string, (...a: unknown[]) => void>> = {};

  levels.forEach(level => {
    originals[level] = (console[level] as (...a: unknown[]) => void).bind(console);
    (console as unknown as Record<string, (...a: unknown[]) => void>)[level] = (...args: unknown[]) => {
      originals[level]?.(...args);
      const dir: LogDirection = level === 'error' ? 'error' : 'system';
      const msg = args.map(serialize).join(' ');
      pushLog(dir, 'console', `console.${level}`, msg);
    };
  });

  const onError = (e: ErrorEvent) => {
    pushLog('error', 'console', 'uncaught', `${e.message} ${e.filename ? `@ ${e.filename}:${e.lineno}` : ''}`);
  };
  const onRejection = (e: PromiseRejectionEvent) => {
    pushLog('error', 'console', 'unhandled-rejection', serialize(e.reason));
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  return () => {
    levels.forEach(level => {
      if (originals[level]) {
        (console as unknown as Record<string, (...a: unknown[]) => void>)[level] = originals[level]!;
      }
    });
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
  };
}
