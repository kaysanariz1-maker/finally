import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { RobotAction } from '../types';

interface ManualControlsProps {
  onTriggerMove: (action: RobotAction) => void;
}

export const ManualControls: React.FC<ManualControlsProps> = ({ onTriggerMove }) => {
  const actions: { id: RobotAction; icon: string; label: string }[] = [
    { id: 'BOW', icon: '🙇', label: 'BOW' },
    { id: 'NOD', icon: '👍', label: 'NOD' },
    { id: 'SHAKE_HEAD', icon: '🙅', label: 'SHAKE HEAD' },
    { id: 'POINT_EXHIBIT', icon: '👉', label: 'POINT EXHIBIT' },
    { id: 'WAVE', icon: '👋', label: 'WAVE' },
    { id: 'IDLE', icon: '⏹️', label: 'IDLE' },
  ];

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Gamepad2 className="w-4 h-4 text-cyan-400" />
          Direct Motor Controls (ESP32)
        </h3>
        <span className="text-[10px] text-slate-400">Test hardware movements</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => onTriggerMove(act.id)}
            className="bg-slate-900/80 hover:bg-purple-900/40 border border-purple-800/40 hover:border-emerald-400/50 rounded-xl p-2.5 text-center text-xs text-slate-200 transition-all flex flex-col items-center gap-1 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">{act.icon}</span>
            <span className="font-medium text-[11px]">{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
