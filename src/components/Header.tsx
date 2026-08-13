import React from 'react';
import { Bot, Radio, Volume2, Cpu } from 'lucide-react';
import { SystemConfig } from '../types';

interface HeaderProps {
  config: SystemConfig;
}

export const Header: React.FC<HeaderProps> = ({ config }) => {
  return (
    <header className="border-b border-purple-900/40 bg-brandBg/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#090514] rounded-[10px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                TARARBARI AI
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Competition V2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Museum Guide Robot Controller</p>
          </div>
        </div>

        {/* Quick Status Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${
            config.geminiKey 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${config.geminiKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-500'}`}></span>
            <Cpu className="w-3 h-3" />
            <span>Gemini AI</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${
            config.elevenKey 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${config.elevenKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-500'}`}></span>
            <Volume2 className="w-3 h-3" />
            <span>ElevenLabs</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${
            config.esp32Ip 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${config.esp32Ip ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-500'}`}></span>
            <Radio className="w-3 h-3" />
            <span>ESP32 ({config.esp32Ip || 'Unset'})</span>
          </div>
        </div>
      </div>
    </header>
  );
};
