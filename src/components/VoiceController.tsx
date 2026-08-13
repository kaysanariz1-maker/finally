import React, { useState } from 'react';
import { Mic, Send } from 'lucide-react';
import { RobotState } from '../types';

interface VoiceControllerProps {
  robotState: RobotState;
  isListening: boolean;
  onToggleListen: () => void;
  onSubmitText: (text: string) => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  robotState,
  isListening,
  onToggleListen,
  onSubmitText,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmitText(inputText.trim());
    setInputText('');
  };

  const getBannerStyle = () => {
    switch (robotState) {
      case 'Listening...':
        return 'bg-emerald-950/60 border-emerald-500/50';
      case 'Gemini Thinking...':
        return 'bg-cyan-950/60 border-cyan-500/50';
      case 'ESP32 Moving...':
        return 'bg-purple-950/60 border-purple-500/50';
      case 'Speaking...':
        return 'bg-emerald-950/60 border-emerald-400/60';
      case 'Idle':
      default:
        return 'bg-slate-900/90 border-slate-800';
    }
  };

  const getDotStyle = () => {
    switch (robotState) {
      case 'Listening...':
        return 'bg-emerald-400 animate-ping';
      case 'Gemini Thinking...':
        return 'bg-cyan-400 animate-spin';
      case 'ESP32 Moving...':
        return 'bg-purple-400 animate-bounce';
      case 'Speaking...':
        return 'bg-emerald-300 animate-pulse';
      case 'Idle':
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 relative overflow-hidden">
      {/* State Banner */}
      <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${getBannerStyle()}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${getDotStyle()}`}></div>
          <div>
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">ROBOT SYSTEM STATE</p>
            <p className="text-base font-bold text-slate-200">{robotState}</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono text-right">
          {robotState === 'Idle' && 'Ready for voice input'}
          {robotState === 'Listening...' && 'Capturing voice audio...'}
          {robotState === 'Gemini Thinking...' && 'Gemini AI generating response...'}
          {robotState === 'ESP32 Moving...' && 'Transmitting move command...'}
          {robotState === 'Speaking...' && 'ElevenLabs playing audio...'}
        </div>
      </div>

      {/* Main Talk Button */}
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        <div className="relative group">
          <div className={`absolute -inset-4 rounded-full transition-all duration-500 blur-xl ${
            isListening 
              ? 'bg-emerald-400 opacity-80 animate-pulse' 
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 group-hover:opacity-60'
          }`}></div>

          <button
            type="button"
            onClick={onToggleListen}
            className={`relative w-36 h-36 rounded-full bg-gradient-to-tr from-slate-900 via-[#130c27] to-slate-900 border-2 text-slate-100 flex flex-col items-center justify-center gap-2 shadow-2xl transition-all duration-300 active:scale-95 select-none ${
              isListening ? 'border-emerald-400' : 'border-cyan-500/50 hover:border-emerald-400'
            }`}
          >
            <div className={`p-3 rounded-full transition-all ${
              isListening ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/10 text-cyan-400 group-hover:text-emerald-300'
            }`}>
              <Mic className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
              {isListening ? 'STOP LISTENING' : 'TALK TO ROBOT'}
            </span>
          </button>
        </div>

        {/* Audio Visualizer */}
        <div className={`h-6 flex items-center gap-1 transition-opacity ${isListening ? 'opacity-100' : 'opacity-20'}`}>
          <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
          <span className="w-1 h-5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
          <span className="w-1 h-6 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          <span className="w-1 h-4 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
        </div>

        <p className="text-xs text-slate-400 text-center max-w-sm">
          Click "Talk to Robot" and speak clearly into your microphone.
        </p>
      </div>

      {/* Text Form */}
      <div className="pt-2 border-t border-purple-900/30">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type a question for Tararbari AI... (e.g. Tell me about this exhibit)"
            className="flex-1 bg-slate-950/80 border border-purple-900/60 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
