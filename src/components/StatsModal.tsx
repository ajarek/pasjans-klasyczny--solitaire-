import React from 'react';
import { SolitaireStats } from '../types/solitaire';
import { X, Trophy, Flame, RotateCcw } from 'lucide-react';

interface StatsModalProps {
  stats: SolitaireStats;
  onResetStats: () => void;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onResetStats, onClose }) => {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const formatTime = (secs: number) => {
    if (!secs) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold font-display tracking-wide text-neutral-100">
              Statystyki Pasjansa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center justify-center">
            <span className="text-xs text-neutral-400">Rozegrane gry</span>
            <span className="text-2xl font-bold font-body tabular-nums text-neutral-100">
              {stats.gamesPlayed}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center justify-center">
            <span className="text-xs text-neutral-400">Wygrane gry</span>
            <span className="text-2xl font-bold font-body tabular-nums text-emerald-400">
              {stats.gamesWon}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center justify-center">
            <span className="text-xs text-neutral-400">Skuteczność (% wygranych)</span>
            <span className="text-2xl font-bold font-body tabular-nums text-amber-400">
              {winRate}%
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center justify-center">
            <span className="text-xs text-neutral-400">Najwyższy wynik</span>
            <span className="text-2xl font-bold font-body tabular-nums text-amber-300">
              {stats.bestScore}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center justify-center">
            <span className="text-xs text-neutral-400">Najlepszy czas</span>
            <span className="text-2xl font-bold font-body tabular-nums text-sky-400">
              {formatTime(stats.bestTime)}
            </span>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center justify-center">
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Seria wygranych
            </span>
            <span className="text-2xl font-bold font-body tabular-nums text-orange-400">
              {stats.currentStreak} <span className="text-xs text-neutral-500 font-normal">(max: {stats.maxStreak})</span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <button
            onClick={() => {
              if (confirm('Czy na pewno chcesz wyczyścić historię statystyk?')) {
                onResetStats();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetuj statystyki
          </button>

          <button
            onClick={onClose}
            className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm rounded-xl transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
