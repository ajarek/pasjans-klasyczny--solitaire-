import React from 'react';
import { X, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold font-display tracking-wide text-neutral-100">
              Zasady Gry w Pasjansa (Klondike)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-sm text-neutral-300 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <h4 className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Cel Gry
            </h4>
            <p className="text-neutral-300 leading-relaxed">
              Celem pasjansa jest ułożenie wszystkich 52 kart w czterech stosach bazowych (w prawym górnym rogu), 
              zaczynając od <strong>Asa</strong> aż do <strong>Króla</strong>, osobno dla każdego z 4 kolorów (Kier ♥, Karo ♦, Trefl ♣, Pik ♠).
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Kolumny Robocze (Tableau)
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-300">
              <li>Karty w kolumnach układa się <strong>malejąco</strong> (od Króla do 2) w <strong>naprzemiennych kolorach</strong> (czerwona na czarną, czarna na czerwoną).</li>
              <li>Możesz przenosić pojedyncze karty lub całe uporządkowane sekwencje kart.</li>
              <li>Na <strong>puste pole</strong> w kolumnie można położyć wyłącznie <strong>Króla</strong> lub stos kart zaczynający się od Króla.</li>
              <li>Usunięcie odkrytych kart odsłania zakrytą kartę znajdującą się pod spodem.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Talia i Stos Dobierania
            </h4>
            <p className="text-neutral-300 leading-relaxed">
              W lewym górnym rogu znajduje się talia rezerwowa. Kliknięcie talii dobiera 1 lub 3 karty na stos odkryty. 
              Gdy talia się wyczerpie, kliknięcie pustego pola obraca stos odkryty z powrotem do rezerwy.
            </p>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
            <h4 className="font-semibold text-neutral-200 mb-2 text-xs uppercase tracking-wider text-amber-400">
              Skróty klawiszowe i sterowanie
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
              <div><strong className="text-neutral-200">Przeciągnij:</strong> Przenoś karty myszką lub dotykiem</div>
              <div><strong className="text-neutral-200">Kliknięcie:</strong> Inteligentne przeniesienie</div>
              <div><strong className="text-neutral-200">Podwójny klik:</strong> Przeniesienie do bazy</div>
              <div><strong className="text-neutral-200">Spacja:</strong> Dobierz kartę z talii</div>
              <div><strong className="text-neutral-200">Z / Ctrl+Z:</strong> Cofnij ruch</div>
              <div><strong className="text-neutral-200">H:</strong> Podpowiedź ruchu</div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm rounded-xl transition-colors"
          >
            Rozumiem, grajmy!
          </button>
        </div>
      </div>
    </div>
  );
};
