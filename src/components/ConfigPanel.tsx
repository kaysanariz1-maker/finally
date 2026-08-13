import React, { useState } from 'react';
import { Sliders, ChevronUp, ChevronDown, Eye, EyeOff, Save, ShieldCheck, Radio, Cpu, Volume2, MicVocal, Wifi } from 'lucide-react';
import { SystemConfig } from '../types';

interface ConfigPanelProps {
  config: SystemConfig;
  onSave: (newConfig: SystemConfig) => void;
  onTestEsp32: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onSave, onTestEsp32 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState<SystemConfig>(config);
  const [showGemini, setShowGemini] = useState(false);
  const [showEleven, setShowEleven] = useState(false);

  const handleChange = (field: keyof SystemConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <section className="glass-card rounded-2xl p-4 sm:p-5 transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="font-semibold text-slate-200">System Configuration Panel</h2>
          <span className="text-xs text-slate-400">(Saved in localStorage)</span>
        </div>
        <button 
          type="button"
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{isOpen ? 'Hide Config' : 'Show Config'}</span>
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gemini Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Gemini API Key
              </label>
              <div className="relative">
                <input 
                  type={showGemini ? 'text' : 'password'}
                  value={formData.geminiKey}
                  onChange={(e) => handleChange('geminiKey', e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-slate-950/80 border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ElevenLabs Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ElevenLabs API Key
              </label>
              <div className="relative">
                <input 
                  type={showEleven ? 'text' : 'password'}
                  value={formData.elevenKey}
                  onChange={(e) => handleChange('elevenKey', e.target.value)}
                  placeholder="sk_..."
                  className="w-full bg-slate-950/80 border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowEleven(!showEleven)}
                  className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
                >
                  {showEleven ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Voice ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <MicVocal className="w-3.5 h-3.5 text-cyan-400" />
                ElevenLabs Voice ID
              </label>
              <input 
                type="text"
                value={formData.voiceId}
                onChange={(e) => handleChange('voiceId', e.target.value)}
                placeholder="21m00Tcm4TlvDq8ikWAM"
                className="w-full bg-slate-950/80 border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* ESP32 IP */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                ESP32 Local IP Address
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={formData.esp32Ip}
                  onChange={(e) => handleChange('esp32Ip', e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full bg-slate-950/80 border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
                <button 
                  type="button"
                  onClick={onTestEsp32}
                  className="bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-slate-200 text-xs px-2.5 rounded-lg whitespace-nowrap flex items-center gap-1"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  Ping
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-purple-900/30">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Settings stored strictly in local browser cache.</span>
            </div>
            <button 
              type="submit"
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              Save Settings
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
