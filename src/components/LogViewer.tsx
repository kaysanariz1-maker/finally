import React from 'react';
import { Terminal, Trash2, RotateCcw } from 'lucide-react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
  memoryTurnCount?: number;
  onResetMemory?: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ 
  logs, 
  onClear,
  memoryTurnCount = 0,
  onResetMemory,
}) => {
  const getCategoryStyle = (category: LogEntry['category']) => {
    switch (category) {
      case 'USER':
        return 'bg-cyan-950/40 border-cyan-800/40 text-cyan-200 tag-cyan-400';
      case 'ROBOT':
        return 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200 tag-emerald-400';
      case 'HARDWARE':
        return 'bg-purple-950/40 border-purple-800/40 text-purple-200 tag-purple-400';
      case 'SUCCESS':
        return 'bg-emerald-950/60 border-emerald-600/50 text-emerald-200 tag-emerald-300';
      case 'WARN':
        return 'bg-amber-950/40 border-amber-800/40 text-amber-200 tag-amber-400';
      case 'ERROR':
        return 'bg-red-950/50 border-red-800/50 text-red-200 tag-red-400';
      case 'INFO':
      default:
        return 'bg-slate-900/80 border-slate-800 text-slate-300 tag-slate-400';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex-1 flex flex-col space-y-3 min-h-[320px]">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Live Robot Interactions & Hardware Log
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Memory: {memoryTurnCount} turn{memoryTurnCount === 1 ? '' : 's'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onResetMemory && (
            <button
              onClick={onResetMemory}
              title="Reset conversation memory history"
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Memory
            </button>
          )}
          <button 
            onClick={onClear}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs font-mono max-h-[380px]">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-sans text-xs">
            No interaction logs yet. Speak or type a question above!
          </div>
        ) : (
          logs.map((log) => {
            const style = getCategoryStyle(log.category);
            return (
              <div 
                key={log.id} 
                className={`p-2.5 rounded-xl border text-xs font-mono space-y-0.5 ${style}`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold opacity-90">[{log.type}]</span>
                  <span className="opacity-60">{log.timestamp}</span>
                </div>
                <p className="font-sans break-words">{log.message}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
