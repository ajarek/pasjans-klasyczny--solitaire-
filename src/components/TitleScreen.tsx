import React, { useEffect } from 'react';
import { SolitaireSettings } from '../types/solitaire';
import { Play, Sparkles, BookOpen, Trophy, Settings, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  settings: SolitaireSettings;
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onUpdateSettings: (settings: Partial<SolitaireSettings>) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  settings,
  onStartGame,
  onOpenSettings,
  onOpenStats,
  onOpenRules,
  onUpdateSettings,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playShuffle();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col justify-between items-center bg-neutral-950 text-white overflow-hidden p-6 select-none">
      {/* Background Hero Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/src/assets/images/solitaire_hero_cards_1794006521896.jpg"
          alt="Solitaire Hero"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30 scale-105 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(217,119,6,0.12)_0%,transparent_60%)]" />
      </div>

      {/* Top Status & Utility Bar */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between py-2">
        <div className="flex items-center gap-2 text-amber-400">
          <span className="text-xl">♠</span>
          <span className="text-xl text-red-500">♥</span>
          <span className="text-xl">♣</span>
          <span className="text-xl text-red-500">♦</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-xs font-medium text-neutral-300 border border-neutral-800 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Zasady
          </button>
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-xs font-medium text-neutral-300 border border-neutral-800 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Statystyki
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
            title="Ustawienia"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Center Hero Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-2xl px-4">
        {/* Royal Crown Ornament SVG */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 text-amber-400">
          <svg viewBox="0 0 100 80" className="w-full h-full fill-current drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
            <path d="M50 10 L62 38 L90 22 L76 65 L24 65 L10 22 L38 38 Z" />
            <circle cx="50" cy="8" r="4" fill="#fbbf24" />
            <circle cx="90" cy="20" r="4" fill="#fbbf24" />
            <circle cx="10" cy="20" r="4" fill="#fbbf24" />
            <rect x="22" y="67" width="56" height="6" rx="3" fill="#d97706" />
          </svg>
        </div>

        {/* Bespoke inline SVG Title Lockup */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-widest font-display text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-md">
          PASJANS
        </h1>
        <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-amber-200/80 font-medium mt-1 mb-6">
          Klasyczny Klondike Solitaire
        </p>

        {/* Quick Mode Toggles */}
        <div className="flex items-center gap-2 p-1 bg-neutral-900/80 border border-neutral-800 rounded-xl mb-6 shadow-inner">
          <button
            onClick={() => onUpdateSettings({ drawMode: 1 })}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              settings.drawMode === 1
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            1 Karta (Łatwy)
          </button>
          <button
            onClick={() => onUpdateSettings({ drawMode: 3 })}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              settings.drawMode === 3
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            3 Karty (Standard)
          </button>
        </div>

        {/* Start Game CTA Button */}
        <button
          onClick={() => {
            sound.playShuffle();
            onStartGame();
          }}
          className="group relative inline-flex items-center gap-3 py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold text-base sm:text-lg shadow-[0_10px_25px_rgba(245,158,11,0.35)] active:scale-95 transition-all duration-200"
        >
          <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
          <span>Rozpocznij Grę</span>
        </button>
      </div>

      {/* Flat Control-Hint Line Footer */}
      <footer className="relative z-10 w-full max-w-4xl text-center py-3 border-t border-neutral-800/60">
        <p className="text-[11px] sm:text-xs text-neutral-400 font-mono tracking-wide">
          Enter / Spacja Rozpocznij · Z Cofnij · H Podpowiedź · Klik / DblClick Auto-Ruch
        </p>
      </footer>
    </div>
  );
};
