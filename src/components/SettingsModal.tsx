import React from 'react';
import { CardBack, SolitaireSettings, TableTheme } from '../types/solitaire';
import { X, Volume2, VolumeX, Sparkles, Palette } from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  settings: SolitaireSettings;
  onUpdateSettings: (newSettings: Partial<SolitaireSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdateSettings, onClose }) => {
  const tableThemes: { id: TableTheme; name: string; bg: string }[] = [
    { id: 'emerald', name: 'Szmaragdowe sukno', bg: 'bg-[#155d37]' },
    { id: 'navy', name: 'Granat kasynowy', bg: 'bg-[#1e3a5f]' },
    { id: 'burgundy', name: 'Bordowy aksamit', bg: 'bg-[#581825]' },
    { id: 'obsidian', name: 'Ciemny łupek', bg: 'bg-[#272c35]' },
  ];

  const cardBacks: { id: CardBack; name: string; color: string }[] = [
    { id: 'royal-gold', name: 'Królewskie Złoto', color: 'bg-emerald-800 border-amber-400' },
    { id: 'vintage-blue', name: 'Błękit Kasynowy', color: 'bg-blue-900 border-blue-400' },
    { id: 'ruby-filigree', name: 'Rubinowy Aksamit', color: 'bg-rose-900 border-amber-300' },
    { id: 'modern-dark', name: 'Matowy Grafit', color: 'bg-neutral-800 border-neutral-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold font-display tracking-wide text-neutral-100">
              Ustawienia Gry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Draw Mode */}
          <div>
            <label className="text-sm font-semibold text-neutral-200 block mb-2">
              Tryb dobierania kart
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateSettings({ drawMode: 1 })}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  settings.drawMode === 1
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                1 Karta (Łatwy / Standard)
              </button>
              <button
                onClick={() => onUpdateSettings({ drawMode: 3 })}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  settings.drawMode === 3
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                3 Karty (Trudniejszy)
              </button>
            </div>
          </div>

          {/* Deal type */}
          <div>
            <label className="text-sm font-semibold text-neutral-200 block mb-2">
              Typ nowego rozdania
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateSettings({ dealType: 'winnable' })}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  settings.dealType === 'winnable'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                Wygrywalne (Zbalansowane)
              </button>
              <button
                onClick={() => onUpdateSettings({ dealType: 'random' })}
                className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  settings.dealType === 'random'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                    : 'border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                Całkowicie losowe
              </button>
            </div>
          </div>

          {/* Table Felt Theme */}
          <div>
            <label className="text-sm font-semibold text-neutral-200 block mb-2">
              Sukno stołu
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {tableThemes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onUpdateSettings({ tableTheme: theme.id })}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                    settings.tableTheme === theme.id
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg mb-1.5 ${theme.bg}`} />
                  <span className="text-xs text-neutral-300 text-center font-medium">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card Back */}
          <div>
            <label className="text-sm font-semibold text-neutral-200 block mb-2">
              Rewers karty
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {cardBacks.map(back => (
                <button
                  key={back.id}
                  onClick={() => onUpdateSettings({ cardBack: back.id })}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                    settings.cardBack === back.id
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className={`w-8 h-11 rounded border ${back.color} mb-1.5`} />
                  <span className="text-xs text-neutral-300 text-center font-medium">
                    {back.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio & Quick Controls */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300 flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
                Efekty dźwiękowe
              </span>
              <button
                onClick={() => {
                  const val = !settings.soundEnabled;
                  sound.enabled = val;
                  onUpdateSettings({ soundEnabled: val });
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.soundEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Kliknięcie / Dotknięcie automatycznie przemieszcza kartę
              </span>
              <button
                onClick={() => onUpdateSettings({ tapToMove: !settings.tapToMove })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.tapToMove ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.tapToMove ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm rounded-xl transition-colors"
          >
            Gotowe
          </button>
        </div>
      </div>
    </div>
  );
};
