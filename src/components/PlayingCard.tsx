import React from 'react';
import { Card, CardBack } from '../types/solitaire';
import { getRankLabel, getSuitColor, getSuitSymbol } from '../utils/solitaireEngine';

interface PlayingCardProps {
  card: Card;
  isDragging?: boolean;
  isSelected?: boolean;
  isHinted?: boolean;
  cardBack?: CardBack;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isDragging = false,
  isSelected = false,
  isHinted = false,
  cardBack = 'royal-gold',
  className = '',
  onClick,
  onDoubleClick,
  onPointerDown,
}) => {
  const isRed = getSuitColor(card.suit) === 'red';
  const rankLabel = getRankLabel(card.rank);
  const suitSymbol = getSuitSymbol(card.suit);

  if (!card.isFaceUp) {
    return (
      <div
        className={`relative w-16 sm:w-20 md:w-24 lg:w-28 aspect-[2.5/3.5] rounded-lg overflow-hidden border border-amber-900/40 select-none shadow-md transition-transform duration-150 ${className}`}
      >
        <CardBackDesign theme={cardBack} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      className={`relative w-16 sm:w-20 md:w-24 lg:w-28 aspect-[2.5/3.5] rounded-lg bg-gradient-to-b from-white via-neutral-50 to-neutral-100 border select-none transition-shadow duration-150 cursor-pointer ${
        isDragging
          ? 'card-shadow-drag scale-105 z-50 ring-2 ring-amber-400 rotate-1'
          : isSelected
          ? 'ring-2 ring-amber-400 shadow-lg -translate-y-1'
          : isHinted
          ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20 animate-pulse'
          : 'card-shadow hover:brightness-105 hover:-translate-y-0.5'
      } ${isRed ? 'border-red-200/80 text-red-600' : 'border-neutral-300 text-neutral-900'} ${className}`}
    >
      {/* Top Left Rank & Suit */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none pointer-events-none">
        <span className="font-bold text-xs sm:text-sm md:text-base font-body tracking-tight">
          {rankLabel}
        </span>
        <span className="text-[10px] sm:text-xs md:text-sm mt-0.5">{suitSymbol}</span>
      </div>

      {/* Center Graphic */}
      <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3 pointer-events-none">
        <CardCenterContent rank={card.rank} suit={card.suit} />
      </div>

      {/* Bottom Right Inverted Rank & Suit */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180 pointer-events-none">
        <span className="font-bold text-xs sm:text-sm md:text-base font-body tracking-tight">
          {rankLabel}
        </span>
        <span className="text-[10px] sm:text-xs md:text-sm mt-0.5">{suitSymbol}</span>
      </div>
    </div>
  );
};

/**
 * Center art of the card: Royal court faces or pip arrangements
 */
const CardCenterContent: React.FC<{ rank: number; suit: Card['suit'] }> = ({ rank, suit }) => {
  const isRed = getSuitColor(suit) === 'red';
  const symbol = getSuitSymbol(suit);

  // Royal Court Cards: Jack, Queen, King
  if (rank === 11) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center border border-amber-500/30 rounded p-1 bg-amber-50/40">
        <svg viewBox="0 0 40 50" className="w-7 sm:w-10 md:w-12 h-9 sm:h-12 md:h-16 text-amber-700">
          <circle cx="20" cy="18" r="9" fill={isRed ? '#fee2e2' : '#e2e8f0'} stroke="#78350f" strokeWidth="1.5" />
          {/* Feather Cap */}
          <path d="M12 14 C12 7, 28 7, 28 14 Z" fill={isRed ? '#dc2626' : '#1e293b'} />
          <path d="M26 6 C32 2, 34 10, 26 12" stroke="#d97706" strokeWidth="1.5" fill="none" />
          {/* Face */}
          <circle cx="17" cy="17" r="1.2" fill="#78350f" />
          <circle cx="23" cy="17" r="1.2" fill="#78350f" />
          <path d="M18 22 Q20 24 22 22" stroke="#78350f" strokeWidth="1" fill="none" />
          {/* Tunic & Halberd */}
          <path d="M13 27 L27 27 L31 46 L9 46 Z" fill={isRed ? '#b91c1c' : '#334155'} stroke="#78350f" strokeWidth="1" />
          <line x1="10" y1="12" x2="10" y2="48" stroke="#d97706" strokeWidth="1.5" />
          <polygon points="7,12 10,6 13,12" fill="#d97706" />
        </svg>
        <span className="text-[9px] sm:text-[10px] font-bold text-amber-900 tracking-wider">WALET</span>
      </div>
    );
  }

  if (rank === 12) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center border border-amber-500/30 rounded p-1 bg-amber-50/40">
        <svg viewBox="0 0 40 50" className="w-7 sm:w-10 md:w-12 h-9 sm:h-12 md:h-16 text-amber-700">
          <circle cx="20" cy="18" r="9" fill={isRed ? '#fee2e2' : '#e2e8f0'} stroke="#78350f" strokeWidth="1.5" />
          {/* Queen Crown */}
          <polygon points="12,12 15,6 20,9 25,6 28,12" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          {/* Face */}
          <circle cx="17" cy="18" r="1.2" fill="#78350f" />
          <circle cx="23" cy="18" r="1.2" fill="#78350f" />
          <path d="M18 22 Q20 24 22 22" stroke="#dc2626" strokeWidth="1" fill="none" />
          {/* Royal Scepter & Robe */}
          <path d="M11 27 L29 27 L32 46 L8 46 Z" fill={isRed ? '#991b1b' : '#1e1b4b'} stroke="#78350f" strokeWidth="1" />
          <path d="M20 27 L20 46" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2,2" />
          <circle cx="30" cy="30" r="3" fill="#f59e0b" />
        </svg>
        <span className="text-[9px] sm:text-[10px] font-bold text-amber-900 tracking-wider">DAMA</span>
      </div>
    );
  }

  if (rank === 13) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center border border-amber-500/30 rounded p-1 bg-amber-50/40">
        <svg viewBox="0 0 40 50" className="w-7 sm:w-10 md:w-12 h-9 sm:h-12 md:h-16 text-amber-700">
          <circle cx="20" cy="18" r="9.5" fill={isRed ? '#fee2e2' : '#e2e8f0'} stroke="#78350f" strokeWidth="1.5" />
          {/* Royal King Crown */}
          <polygon points="11,11 14,4 20,8 26,4 29,11" fill="#d97706" stroke="#78350f" strokeWidth="1" />
          <circle cx="20" cy="4" r="1.5" fill="#ef4444" />
          {/* Beard & Face */}
          <circle cx="17" cy="16" r="1.2" fill="#78350f" />
          <circle cx="23" cy="16" r="1.2" fill="#78350f" />
          <path d="M15 20 C15 26, 25 26, 25 20 Z" fill="#78350f" />
          {/* Royal Mantle & Sword */}
          <path d="M10 27 L30 27 L33 46 L7 46 Z" fill={isRed ? '#7f1d1d' : '#0f172a'} stroke="#78350f" strokeWidth="1" />
          <line x1="30" y1="18" x2="30" y2="44" stroke="#f59e0b" strokeWidth="2" />
          <line x1="27" y1="23" x2="33" y2="23" stroke="#f59e0b" strokeWidth="2" />
        </svg>
        <span className="text-[9px] sm:text-[10px] font-bold text-amber-900 tracking-wider">KRÓL</span>
      </div>
    );
  }

  // Ace
  if (rank === 1) {
    return (
      <div className="flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl md:text-5xl drop-shadow-sm select-none">
          {symbol}
        </span>
      </div>
    );
  }

  // Number Cards (2 to 10)
  return (
    <div className="w-full h-full flex flex-col justify-between items-center py-1 sm:py-2 select-none">
      <div className="flex justify-around w-full text-xs sm:text-sm md:text-base">
        <span>{symbol}</span>
        {rank > 3 && <span>{symbol}</span>}
      </div>
      {(rank === 3 || rank === 5 || rank === 7 || rank === 9) && (
        <div className="text-xs sm:text-sm md:text-base">{symbol}</div>
      )}
      {(rank === 6 || rank === 7 || rank === 8) && (
        <div className="flex justify-around w-full text-xs sm:text-sm md:text-base">
          <span>{symbol}</span>
          {rank >= 7 && <span>{symbol}</span>}
        </div>
      )}
      {rank >= 10 && (
        <div className="flex justify-around w-full text-xs sm:text-sm md:text-base">
          <span>{symbol}</span>
          <span>{symbol}</span>
        </div>
      )}
      <div className="flex justify-around w-full text-xs sm:text-sm md:text-base rotate-180">
        <span>{symbol}</span>
        {rank > 3 && <span>{symbol}</span>}
      </div>
    </div>
  );
};

/**
 * Beautiful ornamental Card Back patterns
 */
const CardBackDesign: React.FC<{ theme: CardBack }> = ({ theme }) => {
  switch (theme) {
    case 'vintage-blue':
      return (
        <div className="w-full h-full bg-blue-950 p-1 sm:p-1.5 flex items-center justify-center">
          <div className="w-full h-full border border-blue-400/40 rounded flex items-center justify-center bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:6px_6px]">
            <div className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 rounded-full border-2 border-blue-400/60 flex items-center justify-center">
              <span className="text-blue-300 text-sm sm:text-lg">♠</span>
            </div>
          </div>
        </div>
      );

    case 'ruby-filigree':
      return (
        <div className="w-full h-full bg-rose-950 p-1 sm:p-1.5 flex items-center justify-center">
          <div className="w-full h-full border border-amber-400/50 rounded flex items-center justify-center bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:6px_6px]">
            <div className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 border border-amber-300 rotate-45 flex items-center justify-center bg-rose-900">
              <span className="text-amber-300 text-sm sm:text-lg -rotate-45">♥</span>
            </div>
          </div>
        </div>
      );

    case 'modern-dark':
      return (
        <div className="w-full h-full bg-neutral-900 p-1 sm:p-1.5 flex items-center justify-center">
          <div className="w-full h-full border border-neutral-700 rounded flex items-center justify-center bg-[radial-gradient(#525252_1px,transparent_1px)] [background-size:5px_5px]">
            <div className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 rounded-lg border border-neutral-600 flex items-center justify-center bg-neutral-800">
              <span className="text-amber-400 font-display font-bold text-xs sm:text-sm">♠</span>
            </div>
          </div>
        </div>
      );

    case 'royal-gold':
    default:
      return (
        <div className="w-full h-full bg-emerald-950 p-1 sm:p-1.5 flex items-center justify-center">
          <div className="w-full h-full border-2 border-amber-400/60 rounded flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-950">
            {/* Ornamental Celtic lattice */}
            <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:8px_8px] opacity-40" />
            <div className="relative w-7 sm:w-9 md:w-11 h-7 sm:h-9 md:h-11 rounded-full border border-amber-400/80 flex items-center justify-center bg-emerald-900/90 shadow-inner">
              <svg viewBox="0 0 24 24" className="w-4 sm:w-6 h-4 sm:h-6 text-amber-400 fill-current">
                <path d="M12 2L15 8H21L16 12L18 18L12 14L6 18L8 12L3 8H9L12 2Z" />
              </svg>
            </div>
          </div>
        </div>
      );
  }
};
