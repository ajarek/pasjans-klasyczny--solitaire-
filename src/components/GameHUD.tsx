import React from 'react';
import {
  RotateCcw,
  RotateCw,
  Lightbulb,
  PlusCircle,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  Trophy,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface GameHUDProps {
  score: number;
  timeSeconds: number;
  moves: number;
  canUndo: boolean;
  canRedo: boolean;
  soundEnabled: boolean;
  canAutoComplete: boolean;
  hintDescription: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onNewGame: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onExitToTitle: () => void;
  onAutoComplete: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  timeSeconds,
  moves,
  canUndo,
  canRedo,
  soundEnabled,
  canAutoComplete,
  hintDescription,
  onUndo,
  onRedo,
  onHint,
  onNewGame,
  onToggleSound,
  onOpenSettings,
  onOpenStats,
  onOpenRules,
  onExitToTitle,
  onAutoComplete,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-white/10 select-none z-30">
      {/* Left: Brand title & Return button */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <button
          onClick={onExitToTitle}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-black/30 hover:bg-black/50 text-neutral-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
          title="Powrót do menu"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-amber-300 tracking-wider text-base sm:text-lg">
            PASJANS
          </span>
          <div className="hidden md:flex items-center gap-1 text-[11px] text-amber-200/60 font-mono">
            <span>♠</span>
            <span className="text-red-400">♥</span>
            <span>♣</span>
            <span className="text-red-400">♦</span>
          </div>
        </div>

        {/* Mobile quick actions */}
        <div className="flex sm:hidden items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg bg-black/30 disabled:opacity-30 border border-white/10 text-neutral-300"
            title="Cofnij"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onHint}
            className="p-1.5 rounded-lg bg-black/30 border border-white/10 text-amber-300"
            title="Podpowiedź"
          >
            <Lightbulb className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Score, Time & Moves Clusters */}
      <div className="flex items-center gap-3 sm:gap-6 bg-black/40 px-3 sm:px-5 py-1.5 rounded-xl border border-white/10 shadow-inner">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Wynik</span>
          <span className="text-sm sm:text-base font-bold font-body tabular-nums text-amber-300">
            {score}
          </span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Czas</span>
          <span className="text-sm sm:text-base font-bold font-body tabular-nums text-neutral-200">
            {formatTime(timeSeconds)}
          </span>
        </div>

        <div className="w-px h-6 bg-white/10" />

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400">Ruchy</span>
          <span className="text-sm sm:text-base font-bold font-body tabular-nums text-neutral-200">
            {moves}
          </span>
        </div>

        {canAutoComplete && (
          <button
            onClick={onAutoComplete}
            className="ml-2 flex items-center gap-1.5 py-1 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-neutral-950 font-bold text-xs rounded-lg shadow-md animate-pulse active:scale-95 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ukończ grę</span>
          </button>
        )}
      </div>

      {/* Right: Desktop Action Controls */}
      <div className="hidden sm:flex items-center gap-1.5">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-black/30 hover:bg-black/50 disabled:opacity-40 disabled:hover:bg-black/30 text-xs font-medium text-neutral-200 border border-white/10 transition-colors"
          title="Cofnij (Ctrl+Z)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-neutral-300" />
          <span>Cofnij</span>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-black/30 hover:bg-black/50 disabled:opacity-40 disabled:hover:bg-black/30 text-xs font-medium text-neutral-200 border border-white/10 transition-colors"
          title="Ponów (Ctrl+Y)"
        >
          <RotateCw className="w-3.5 h-3.5 text-neutral-300" />
          <span>Ponów</span>
        </button>

        <button
          onClick={onHint}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-black/30 hover:bg-black/50 text-xs font-medium text-amber-300 border border-white/10 transition-colors"
          title="Podpowiedź (H)"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Podpowiedź</span>
        </button>

        <button
          onClick={onNewGame}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-medium text-amber-300 border border-amber-500/30 transition-colors"
          title="Nowa Gra (N)"
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Nowa gra</span>
        </button>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-neutral-300 border border-white/10 transition-colors"
          title={soundEnabled ? 'Wycisz (M)' : 'Włącz dźwięk (M)'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
        </button>

        <button
          onClick={onOpenStats}
          className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-neutral-300 border border-white/10 transition-colors"
          title="Statystyki"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={onOpenRules}
          className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-neutral-300 border border-white/10 transition-colors"
          title="Zasady gry"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-neutral-300 border border-white/10 transition-colors"
          title="Ustawienia"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Hint Banner if active */}
      {hintDescription && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/95 border border-amber-400/80 text-amber-200 text-xs py-1.5 px-4 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{hintDescription}</span>
        </div>
      )}
    </header>
  );
};
