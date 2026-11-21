import React, { useEffect } from 'react';
import { HeroKey } from '../types/game';
import { HERO_DATABASE } from '../game/constants';
import { sounds } from '../audio/soundManager';
import { Play, Volume2, VolumeX, FlaskConical } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onStartPractice: () => void;
  onSelectHeroDirect: (hero: HeroKey) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onStartPractice,
  onSelectHeroDirect,
  isMuted,
  onToggleMute
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        sounds.playSelect();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col justify-between p-6 md:p-12 overflow-y-auto">
      {/* Top Bar with sound toggle */}
      <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-xs font-mono tracking-widest text-slate-400 uppercase">Version 2.0 · Arena Survival</span>
        </div>
        <button
          onClick={onToggleMute}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-xs font-game"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? 'Muted' : 'Sound On'}</span>
        </button>
      </div>

      {/* Hero Title Lockup & 35% Negative Space */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-4xl mx-auto py-8">
        {/* Bespoke Inline SVG Logo Lockup */}
        <div className="relative mb-6">
          <svg className="w-20 h-20 md:w-28 md:h-28 mx-auto drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]" viewBox="0 0 100 100" fill="none">
            <polygon points="50,5 92,28 92,72 50,95 8,72 8,28" stroke="url(#cyanGrad)" strokeWidth="3" fill="rgba(15, 23, 42, 0.6)" />
            <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" stroke="url(#goldGrad)" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M50 25 L50 75 M30 40 L70 40 M35 60 L65 60" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
            <defs>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4" />
                <stop offset="1" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className="font-title text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-400 drop-shadow-md">
          FANTASY ARENA
        </h1>
        <p className="font-title text-sm sm:text-lg tracking-widest text-cyan-300/80 uppercase mt-2 mb-4">
          AUTO BATTLE SURVIVOR
        </p>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
          Kendalikan pahlawan legendaris dalam pertarungan arena tanpa henti. Kloning master kera, sinar laser kehampaan, pergeseran dimensi waktu, dan build atribut tanpa batas.
        </p>

        {/* Primary & Practice Mode CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <button
            onClick={() => { sounds.playSelect(); onStart(); }}
            className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-title font-black text-lg sm:text-xl tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer w-full sm:w-auto"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>MULAI PERTARUNGAN</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-950/30 text-slate-900 font-mono">ENTER</span>
          </button>

          <button
            onClick={() => { sounds.playSelect(); onStartPractice(); }}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border-2 border-emerald-400/70 text-emerald-300 hover:text-emerald-200 font-title font-black text-base sm:text-lg tracking-wider shadow-[0_0_24px_rgba(16,185,129,0.25)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer w-full sm:w-auto"
          >
            <FlaskConical className="w-5 h-5" />
            <span>MODE PRACTICE</span>
          </button>
        </div>

        {/* Character Roster Quick Selector */}
        <div className="flex flex-wrap justify-center gap-3 mt-10 w-full max-w-5xl">
          {Object.values(HERO_DATABASE).map((h) => (
            <button
              key={h.key}
              onClick={() => { sounds.playSelect(); onSelectHeroDirect(h.key); }}
              className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)] p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-600 text-left transition-all hover:bg-slate-800/80 group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: h.color }}></span>
                <span className="font-title text-xs font-bold text-slate-200 group-hover:text-white truncate">{h.name}</span>
              </div>
              <span className="text-[11px] text-slate-400 block truncate">{h.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flat Single Control-Hint Line */}
      <div className="w-full text-center py-4 border-t border-slate-900">
        <p className="text-xs text-slate-500 font-game tracking-wider">
          WASD / Drag Move · Space Action · 1–5 Manual Skills · Esc Pause · M Mute
        </p>
      </div>
    </div>
  );
};
