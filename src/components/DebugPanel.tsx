import { useEffect, useRef, useState, useCallback } from 'react';

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
  raw: unknown[];
}

let _counter = 0;

const LEVEL_STYLES: Record<LogLevel, { badge: string; row: string; text: string }> = {
  log:   { badge: 'bg-slate text-white',              row: '',                        text: 'text-off-white' },
  debug: { badge: 'bg-slate text-white',              row: '',                        text: 'text-silver' },
  info:  { badge: 'bg-rockman-blue text-white',       row: 'bg-rockman-blue/5',       text: 'text-joust-blue' },
  warn:  { badge: 'bg-chunky-bee text-charcoal',      row: 'bg-yellow-900/20',        text: 'text-chunky-bee' },
  error: { badge: 'bg-spicy-sweetcorn text-white',    row: 'bg-red-900/20',           text: 'text-spicy-sweetcorn' },
};

function serialize(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val instanceof Error) return `${val.name}: ${val.message}`;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [pinnedToBottom, setPinnedToBottom] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const originals = useRef<Partial<Record<LogLevel, (...a: unknown[]) => void>>>({});

  const addEntry = useCallback((level: LogLevel, args: unknown[]) => {
    const message = args.map(serialize).join(' ');
    const entry: LogEntry = {
      id: ++_counter,
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + '.' + String(Date.now() % 1000).padStart(3, '0'),
      level,
      message,
      raw: args,
    };
    setLogs(prev => [...prev.slice(-999), entry]);
  }, []);

  useEffect(() => {
    const levels: LogLevel[] = ['log', 'warn', 'error', 'info'];

    levels.forEach(level => {
      originals.current[level] = (console[level] as (...a: unknown[]) => void).bind(console);
      (console as unknown as Record<string, (...a: unknown[]) => void>)[level] = (...args: unknown[]) => {
        originals.current[level]?.(...args);
        addEntry(level, args);
      };
    });

    const onError = (e: ErrorEvent) => {
      addEntry('error', [`[uncaught] ${e.message}`, e.filename ? `${e.filename}:${e.lineno}` : ''].filter(Boolean));
    };

    const onRejection = (e: PromiseRejectionEvent) => {
      addEntry('error', [`[unhandled rejection] ${serialize(e.reason)}`]);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    addEntry('info', ['[DebugPanel] Console capture active']);

    return () => {
      levels.forEach(level => {
        if (originals.current[level]) {
          (console as unknown as Record<string, (...a: unknown[]) => void>)[level] = originals.current[level]!;
        }
      });
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [addEntry]);

  useEffect(() => {
    if (pinnedToBottom && isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [logs, pinnedToBottom, isOpen]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    setPinnedToBottom(atBottom);
  };

  const filtered = filter
    ? logs.filter(l => l.message.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  const counts = {
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1 transition-all duration-300 ${
          isOpen ? 'right-[380px]' : 'right-0'
        }`}
        title={isOpen ? 'Fermer le panel debug' : 'Ouvrir le panel debug'}
        style={{ writingMode: 'horizontal-tb' }}
      >
        <div className="bg-charcoal text-white rounded-l-lg px-2 py-3 shadow-lg hover:bg-slate transition-colors flex flex-col items-center gap-1.5">
          <span
            className="text-xs font-mono font-bold"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            DEBUG
          </span>
          {counts.error > 0 && (
            <span className="w-4 h-4 rounded-full bg-spicy-sweetcorn text-white text-xs flex items-center justify-center font-bold leading-none">
              {counts.error > 9 ? '9+' : counts.error}
            </span>
          )}
          {counts.error === 0 && counts.warn > 0 && (
            <span className="w-4 h-4 rounded-full bg-chunky-bee text-charcoal text-xs flex items-center justify-center font-bold leading-none">
              {counts.warn > 9 ? '9+' : counts.warn}
            </span>
          )}
          <span className="text-silver text-xs">{isOpen ? '→' : '←'}</span>
        </div>
      </button>

      <div
        className={`fixed top-0 right-0 h-full z-40 bg-[#0d1117] border-l border-[#30363d] flex flex-col shadow-2xl transition-all duration-300 ${
          isOpen ? 'w-[380px]' : 'w-0 overflow-hidden'
        }`}
      >
        {isOpen && (
          <>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono">DEBUG</span>
                <span className="text-xs text-[#8b949e] font-mono">{logs.length} logs</span>
                {counts.error > 0 && (
                  <span className="text-xs bg-spicy-sweetcorn text-white rounded-full px-1.5 py-0.5 font-bold">
                    {counts.error} err
                  </span>
                )}
                {counts.warn > 0 && (
                  <span className="text-xs bg-chunky-bee text-charcoal rounded-full px-1.5 py-0.5 font-bold">
                    {counts.warn} warn
                  </span>
                )}
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-xs text-[#8b949e] hover:text-white transition-colors px-2 py-1 rounded hover:bg-[#21262d]"
              >
                Clear
              </button>
            </div>

            <div className="px-3 py-2 border-b border-[#30363d] shrink-0">
              <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filtrer les logs..."
                className="w-full bg-[#21262d] border border-[#30363d] text-white text-xs rounded px-2 py-1.5 placeholder:text-[#8b949e] focus:outline-none focus:border-rockman-blue font-mono"
              />
            </div>

            <div
              ref={listRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto font-mono text-xs"
            >
              {filtered.length === 0 && (
                <div className="flex items-center justify-center h-full text-[#8b949e] text-xs">
                  {filter ? 'Aucun résultat' : 'En attente de logs...'}
                </div>
              )}
              {filtered.map(entry => {
                const style = LEVEL_STYLES[entry.level] || LEVEL_STYLES.log;
                return (
                  <div
                    key={entry.id}
                    className={`group flex gap-2 px-3 py-1.5 border-b border-[#21262d] hover:bg-[#21262d] ${style.row}`}
                  >
                    <span className="text-[#8b949e] shrink-0 mt-0.5 text-[10px] leading-4 tabular-nums">
                      {entry.timestamp}
                    </span>
                    <span className={`shrink-0 mt-0.5 text-[9px] uppercase font-bold px-1 rounded leading-4 ${style.badge}`}>
                      {entry.level}
                    </span>
                    <span className={`flex-1 break-all whitespace-pre-wrap leading-4 ${style.text} text-[11px]`}>
                      {entry.message}
                    </span>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {!pinnedToBottom && (
              <button
                onClick={() => {
                  setPinnedToBottom(true);
                  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute bottom-3 right-3 bg-charcoal text-white text-xs px-3 py-1.5 rounded-full shadow-lg hover:bg-slate transition-colors border border-[#30363d]"
              >
                ↓ Aller en bas
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
