import React from 'react';
import { Volume2, VolumeX, Shield, Save, Download, RefreshCw, Users, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  realmName: string;
  characterName: string;
  level: number;
  xp: number;
  maxXp: number;
  onOpenCommunity: () => void;
  onRestartSession: () => void;
  onExportJournal: () => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  realmName,
  characterName,
  level,
  xp,
  maxXp,
  onOpenCommunity,
  onRestartSession,
  onExportJournal,
  isMuted,
  setIsMuted,
}) => {
  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 text-slate-100 px-4 py-3 sticky top-0 z-30 backdrop-blur-md shadow-lg flex flex-wrap items-center justify-between gap-3">
      {/* Title & Realm */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-wide text-white font-serif">ChronoQuest</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              Infinite CYOA
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Realm: <strong className="text-slate-200">{realmName}</strong></span>
          </p>
        </div>
      </div>

      {/* Hero Quick Badge */}
      <div className="hidden md:flex items-center gap-4 bg-slate-950/60 px-4 py-1.5 rounded-xl border border-slate-800">
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-200">{characterName}</p>
          <p className="text-[11px] text-amber-400 font-mono">Level {level} Hero</p>
        </div>
        <div className="w-24">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
            <span>XP</span>
            <span>{xp}/{maxXp}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (xp / maxXp) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommunity}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all shadow-sm border border-indigo-400/30"
          title="Community D&D Tavern Board"
        >
          <Users className="w-3.5 h-3.5 text-indigo-200" />
          <span className="hidden sm:inline">Tethered Souls</span>
        </button>

        <button
          onClick={onExportJournal}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          title="Export Quest Chronicles (Markdown)"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleSound}
          className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
        </button>

        <button
          onClick={onRestartSession}
          className="p-2 text-slate-400 hover:text-amber-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          title="Start New Character / Realm"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
