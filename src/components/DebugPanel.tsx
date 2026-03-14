import { useEffect, useRef, useState, useCallback } from 'react';
import { Copy, Check, Trash2, ChevronRight, ChevronLeft, Search, X } from 'lucide-react';
import {
  subscribeDebugLog,
  getDebugBuffer,
  clearDebugBuffer,
  exportLogsAsText,
  installConsoleCapture,
  type DebugLogEntry,
  type LogDirection,
  type LogCategory,
} from '../lib/debugLog';

const DIR_CONFIG: Record<LogDirection, { icon: string; color: string; bg: string }> = {
  out:    { icon: '>>', color: 'text-sky-400',    bg: 'bg-sky-400/5' },
  in:     { icon: '<<', color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
  system: { icon: '--', color: 'text-zinc-400',   bg: '' },
  error:  { icon: '!!', color: 'text-red-400',    bg: 'bg-red-500/10' },
};

const CAT_COLORS: Record<LogCategory, string> = {
  'sdk-call':  'bg-sky-500/20 text-sky-300',
  'sdk-event': 'bg-emerald-500/20 text-emerald-300',
  ws:          'bg-amber-500/20 text-amber-300',
  console:     'bg-zinc-500/20 text-zinc-400',
  lifecycle:   'bg-violet-500/20 text-violet-300',
};

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [logs, setLogs] = useState<DebugLogEntry[]>(getDebugBuffer);
  const [filter, setFilter] = useState('');
  const [catFilter, setCatFilter] = useState<LogCategory | 'all'>('all');
  const [pinnedToBottom, setPinnedToBottom] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const teardown = installConsoleCapture();
    const unsub = subscribeDebugLog((entry) => {
      setLogs(prev => {
        const next = [...prev, entry];
        return next.length > 2000 ? next.slice(-2000) : next;
      });
    });
    return () => { unsub(); teardown(); };
  }, []);

  useEffect(() => {
    if (pinnedToBottom && isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [logs, pinnedToBottom, isOpen]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setPinnedToBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  }, []);

  const handleCopy = async () => {
    const text = exportLogsAsText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    clearDebugBuffer();
    setLogs([]);
    setExpandedIds(new Set());
  };

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = logs.filter(e => {
    if (catFilter !== 'all' && e.category !== catFilter) return false;
    if (filter && !e.label.toLowerCase().includes(filter.toLowerCase()) && !e.detail.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total: logs.length,
    error: logs.filter(l => l.direction === 'error').length,
    sdkCall: logs.filter(l => l.category === 'sdk-call').length,
    sdkEvent: logs.filter(l => l.category === 'sdk-event').length,
  };

  const categories: { value: LogCategory | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: logs.length },
    { value: 'sdk-call', label: 'SDK Calls', count: counts.sdkCall },
    { value: 'sdk-event', label: 'Events', count: counts.sdkEvent },
    { value: 'console', label: 'Console', count: logs.filter(l => l.category === 'console').length },
    { value: 'lifecycle', label: 'Lifecycle', count: logs.filter(l => l.category === 'lifecycle').length },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          isOpen ? 'right-[420px]' : 'right-0'
        }`}
      >
        <div className="bg-[#0d1117] border border-[#30363d] border-r-0 rounded-l-lg px-1.5 py-4 shadow-2xl hover:bg-[#161b22] transition-colors flex flex-col items-center gap-2">
          {isOpen ? <ChevronRight className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />}
          <span
            className="text-[10px] font-mono font-bold text-zinc-300 tracking-wider"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            DEBUG
          </span>
          {counts.error > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
              {counts.error > 99 ? '99' : counts.error}
            </span>
          )}
        </div>
      </button>

      <div
        className={`fixed top-0 right-0 h-full z-40 bg-[#0d1117] border-l border-[#30363d] flex flex-col shadow-2xl transition-all duration-300 ${
          isOpen ? 'w-[420px]' : 'w-0 overflow-hidden'
        }`}
      >
        {isOpen && (
          <>
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#30363d] shrink-0 bg-[#161b22]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-200 font-mono">DEBUG</span>
                <span className="text-[10px] text-zinc-500 font-mono">{counts.total} logs</span>
                {counts.error > 0 && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 rounded-full px-1.5 py-0.5 font-bold font-mono">
                    {counts.error} err
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 rounded hover:bg-[#21262d] font-mono"
                  title="Copy all logs"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 rounded hover:bg-[#21262d]"
                  title="Clear logs"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#30363d] shrink-0 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCatFilter(cat.value)}
                  className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    catFilter === cat.value
                      ? 'bg-[#21262d] text-zinc-200 border border-[#30363d]'
                      : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  {cat.label}
                  <span className="text-zinc-600">{cat.count}</span>
                </button>
              ))}
            </div>

            <div className="px-3 py-1.5 border-b border-[#30363d] shrink-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                <input
                  type="text"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Filter logs..."
                  className="w-full bg-[#21262d] border border-[#30363d] text-zinc-200 text-[11px] rounded pl-7 pr-7 py-1.5 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500/50 font-mono"
                />
                {filter && (
                  <button
                    onClick={() => setFilter('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                  </button>
                )}
              </div>
            </div>

            <div
              ref={listRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto"
            >
              {filtered.length === 0 && (
                <div className="flex items-center justify-center h-32 text-zinc-600 text-xs font-mono">
                  {filter || catFilter !== 'all' ? 'No matching logs' : 'Waiting for logs...'}
                </div>
              )}
              {filtered.map(entry => (
                <LogRow
                  key={entry.id}
                  entry={entry}
                  expanded={expandedIds.has(entry.id)}
                  onToggle={() => toggleExpand(entry.id)}
                />
              ))}
              <div ref={bottomRef} />
            </div>

            {!pinnedToBottom && (
              <button
                onClick={() => {
                  setPinnedToBottom(true);
                  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#161b22] text-zinc-300 text-[10px] px-3 py-1.5 rounded-full shadow-lg hover:bg-[#21262d] transition-colors border border-[#30363d] font-mono"
              >
                Scroll to bottom
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

function LogRow({ entry, expanded, onToggle }: { entry: DebugLogEntry; expanded: boolean; onToggle: () => void }) {
  const dir = DIR_CONFIG[entry.direction];
  const catColor = CAT_COLORS[entry.category] || CAT_COLORS.console;
  const hasDetail = entry.detail.length > 0;
  const isMultiline = entry.detail.includes('\n') || entry.detail.length > 80;

  return (
    <div
      className={`border-b border-[#21262d] hover:bg-[#161b22] transition-colors ${dir.bg}`}
    >
      <div
        className={`flex items-start gap-1.5 px-3 py-1 ${hasDetail && isMultiline ? 'cursor-pointer' : ''}`}
        onClick={hasDetail && isMultiline ? onToggle : undefined}
      >
        <span className="text-[10px] text-zinc-600 font-mono shrink-0 mt-0.5 tabular-nums leading-4">
          {entry.timeStr}
        </span>
        <span className={`text-[10px] font-bold font-mono shrink-0 mt-0.5 leading-4 w-4 text-center ${dir.color}`}>
          {dir.icon}
        </span>
        <span className={`text-[9px] font-mono font-bold px-1 rounded shrink-0 mt-0.5 leading-4 ${catColor}`}>
          {entry.category === 'sdk-call' ? 'CALL' : entry.category === 'sdk-event' ? 'EVT' : entry.category.toUpperCase()}
        </span>
        <span className={`text-[11px] font-mono font-medium leading-4 mt-0.5 ${dir.color}`}>
          {entry.label}
        </span>
        {hasDetail && !isMultiline && (
          <span className="text-[10px] font-mono text-zinc-500 leading-4 mt-0.5 truncate flex-1 min-w-0">
            {entry.detail}
          </span>
        )}
        {hasDetail && isMultiline && (
          <span className="text-[10px] text-zinc-600 mt-0.5 leading-4 shrink-0 ml-auto">
            {expanded ? '[-]' : '[+]'}
          </span>
        )}
      </div>
      {expanded && hasDetail && (
        <div className="px-3 pb-2 pl-[88px]">
          <pre className="text-[10px] font-mono text-zinc-400 whitespace-pre-wrap break-all leading-relaxed bg-[#0d1117] rounded p-2 border border-[#21262d] max-h-48 overflow-y-auto">
            {entry.detail}
          </pre>
        </div>
      )}
    </div>
  );
}
