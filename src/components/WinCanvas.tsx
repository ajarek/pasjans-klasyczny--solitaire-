import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../types/solitaire';
import { getRankLabel, getSuitColor, getSuitSymbol } from '../utils/solitaireEngine';
import { sound } from '../utils/audio';

interface WinCanvasProps {
  score: number;
  moves: number;
  timeSeconds: number;
  onPlayAgain: () => void;
}

interface BouncingCard {
  suit: Card['suit'];
  rank: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isRed: boolean;
  bounces: number;
}

export const WinCanvas: React.FC<WinCanvasProps> = ({ score, moves, timeSeconds, onPlayAgain }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    sound.playWinFanfare();
    const timer = setTimeout(() => setShowModal(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const cardWidth = Math.max(70, Math.min(100, width * 0.08));
    const cardHeight = cardWidth * 1.4;

    // Build the 52 cards to cascade from the 4 foundation positions
    const cardsToDrop: BouncingCard[] = [];
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];

    suits.forEach((suit, sIdx) => {
      // 4 foundation approximate locations at top right
      const startX = width * 0.45 + sIdx * (cardWidth + 16);
      const startY = 80;

      for (let rank = 13; rank >= 1; rank--) {
        cardsToDrop.push({
          suit,
          rank,
          x: startX,
          y: startY,
          vx: (Math.random() - 0.4) * 8 - 2,
          vy: -Math.random() * 4 - 1,
          width: cardWidth,
          height: cardHeight,
          isRed: getSuitColor(suit) === 'red',
          bounces: 0,
        });
      }
    });

    // Shuffle launch order so all 4 piles burst rhythmically
    cardsToDrop.sort(() => Math.random() - 0.5);

    let activeCards: BouncingCard[] = [];
    let nextCardIndex = 0;
    let frameCount = 0;
    const gravity = 0.55;
    const bounceDecay = 0.82;

    const renderCard = (c: BouncingCard) => {
      // Draw card body
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#d4d4d8';
      ctx.lineWidth = 1;

      // Rounded rectangle
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(c.x + radius, c.y);
      ctx.lineTo(c.x + c.width - radius, c.y);
      ctx.quadraticCurveTo(c.x + c.width, c.y, c.x + c.width, c.y + radius);
      ctx.lineTo(c.x + c.width, c.y + c.height - radius);
      ctx.quadraticCurveTo(c.x + c.width, c.y + c.height, c.x + c.width - radius, c.y + c.height);
      ctx.lineTo(c.x + radius, c.y + c.height);
      ctx.quadraticCurveTo(c.x, c.y + c.height, c.x, c.y + c.height - radius);
      ctx.lineTo(c.x, c.y + radius);
      ctx.quadraticCurveTo(c.x, c.y, c.x + radius, c.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Card Rank & Suit
      ctx.fillStyle = c.isRed ? '#dc2626' : '#18181b';
      ctx.font = `bold ${Math.floor(c.width * 0.22)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const label = getRankLabel(c.rank);
      const symbol = getSuitSymbol(c.suit);

      ctx.fillText(label, c.x + 6, c.y + 4);
      ctx.font = `${Math.floor(c.width * 0.2)}px sans-serif`;
      ctx.fillText(symbol, c.x + 6, c.y + 4 + c.width * 0.22);

      // Large Center Symbol
      ctx.font = `${Math.floor(c.width * 0.45)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, c.x + c.width / 2, c.y + c.height / 2);
    };

    const loop = () => {
      frameCount++;

      // Spawn next card every 4 frames
      if (frameCount % 4 === 0 && nextCardIndex < cardsToDrop.length) {
        activeCards.push(cardsToDrop[nextCardIndex++]);
      }

      // Update and stamp active cards (Notice: we DO NOT clearRect! This creates the legendary Solitaire cascade trail)
      for (let i = activeCards.length - 1; i >= 0; i--) {
        const c = activeCards[i];

        renderCard(c);

        c.x += c.vx;
        c.vy += gravity;
        c.y += c.vy;

        // Bounce off bottom
        if (c.y + c.height >= height) {
          c.y = height - c.height;
          c.vy = -c.vy * bounceDecay;
          c.bounces++;
          if (c.bounces === 1) {
            sound.playDrop();
          }
        }

        // Bounce off side walls
        if (c.x <= 0 || c.x + c.width >= width) {
          c.vx = -c.vx;
        }

        // Retire card after it falls off or settles
        if (c.y > height + 200 || (Math.abs(c.vy) < 0.2 && c.y >= height - c.height - 2)) {
          // Keep it stamped on canvas, just stop updating physics
          activeCards.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* 60fps cascading canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full cursor-pointer" onClick={() => setShowModal(true)} />

      {/* Victory modal card */}
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md bg-neutral-900 border border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Crown insignia */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-amber-400 fill-current">
                <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display text-amber-300 tracking-wider">
              ZWYCIĘSTWO!
            </h2>
            <p className="text-sm text-neutral-300 mt-1">
              Wszystkie 52 karty ułożone w bazach. Wspaniała rozgrywka!
            </p>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 my-6 p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Wynik</span>
                <span className="text-xl sm:text-2xl font-bold font-body tabular-nums text-emerald-400">
                  {score}
                </span>
              </div>
              <div className="flex flex-col border-x border-neutral-800">
                <span className="text-xs text-neutral-400">Czas</span>
                <span className="text-xl sm:text-2xl font-bold font-body tabular-nums text-amber-300">
                  {formatTime(timeSeconds)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">Ruchy</span>
                <span className="text-xl sm:text-2xl font-bold font-body tabular-nums text-neutral-200">
                  {moves}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onPlayAgain}
                className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
              >
                Nowa gra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
