import React from 'react';
import { RobotAction } from '../types';

interface RobotAvatarProps {
  currentAction: RobotAction;
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({ currentAction }) => {
  const getActionText = (action: RobotAction) => {
    switch (action) {
      case 'BOW':
        return 'Bowing respectfully to welcome museum visitor';
      case 'NOD':
        return 'Nodding head in agreement and validation';
      case 'SHAKE_HEAD':
        return 'Shaking head to indicate uncertainty or polite disagreement';
      case 'POINT_EXHIBIT':
        return 'Extending right arm pointing toward museum artifact';
      case 'WAVE':
        return 'Raising left arm and waving hand to greet visitor';
      case 'IDLE':
      default:
        return 'Standing idle & awaiting visitor interaction';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-[11px] font-mono text-slate-400">ROBOT_VISUALIZER_V2</span>
      </div>

      <div className="absolute top-3 right-3 text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
        ACTION: {currentAction}
      </div>

      {/* Robot Graphic */}
      <div className="w-64 h-64 my-4 relative flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr transition-all duration-500 blur-xl ${
          currentAction === 'BOW' ? 'from-purple-600/40 to-cyan-500/30' :
          currentAction === 'NOD' ? 'from-emerald-500/40 to-cyan-500/30' :
          currentAction === 'SHAKE_HEAD' ? 'from-amber-500/30 to-purple-500/30' :
          currentAction === 'POINT_EXHIBIT' ? 'from-cyan-500/50 to-emerald-400/40' :
          currentAction === 'WAVE' ? 'from-emerald-400/50 to-cyan-400/40' :
          'from-purple-600/20 via-cyan-500/20 to-emerald-500/20'
        }`}></div>

        <svg 
          viewBox="0 0 200 200" 
          className={`w-full h-full relative z-10 transition-transform duration-500 ${
            currentAction === 'BOW' ? 'rotate-6 translate-y-2' : ''
          }`}
        >
          {/* Cyber Ring */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(147, 51, 234, 0.2)" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" />

          {/* Torso */}
          <path d="M 60 145 L 140 145 L 130 185 L 70 185 Z" fill="#1e1338" stroke="#06b6d4" strokeWidth="2" />
          <circle cx="100" cy="162" r="10" fill="#06b6d4" className="animate-pulse" />
          <circle cx="100" cy="162" r="5" fill="#6ee7b7" />

          {/* Left Arm */}
          <g className={`origin-[50px_145px] transition-transform duration-500 ${currentAction === 'WAVE' ? 'animate-wave-hand' : ''}`}>
            <path d="M 50 145 L 30 170 Q 20 180 25 188" fill="none" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" />
            <circle cx="25" cy="188" r="5" fill="#34d399" />
          </g>

          {/* Right Arm */}
          <g className={`origin-[150px_145px] transition-transform duration-500 ${currentAction === 'POINT_EXHIBIT' ? '-rotate-45 -translate-y-4' : ''}`}>
            <path d="M 150 145 L 170 170 Q 180 180 175 188" fill="none" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" />
            <circle cx="175" cy="188" r="5" fill="#34d399" />
          </g>

          {/* Neck */}
          <rect x="92" y="125" width="16" height="20" fill="#2d1b4e" rx="3" stroke="#9333ea" strokeWidth="1" />

          {/* Head */}
          <g className={`origin-[100px_100px] transition-transform duration-500 ${
            currentAction === 'NOD' ? 'animate-nod-head' : 
            currentAction === 'SHAKE_HEAD' ? 'animate-shake-head' : ''
          }`}>
            <rect x="60" y="65" width="80" height="60" rx="18" fill="#130c27" stroke="#34d399" strokeWidth="2.5" />
            <rect x="68" y="77" width="64" height="28" rx="10" fill="#090514" stroke="#06b6d4" strokeWidth="1.5" />

            <circle cx="84" cy="91" r="6" fill="#34d399" className="animate-pulse" />
            <circle cx="84" cy="91" r="2" fill="#ffffff" />

            <circle cx="116" cy="91" r="6" fill="#34d399" className="animate-pulse" />
            <circle cx="116" cy="91" r="2" fill="#ffffff" />

            <line x1="84" y1="113" x2="116" y2="113" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />

            <line x1="100" y1="65" x2="100" y2="45" stroke="#a855f7" strokeWidth="2" />
            <circle cx="100" cy="42" r="5" fill="#06b6d4" className="animate-ping" />
            <circle cx="100" cy="42" r="4" fill="#34d399" />
          </g>
        </svg>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs text-slate-400">Current Gesture State</p>
        <p className="text-sm font-semibold text-emerald-300">{getActionText(currentAction)}</p>
      </div>
    </div>
  );
};
