import React, { useRef, useState, useEffect } from 'react';
import { Card, CardBack, DragSource, Hint, SolitaireState } from '../types/solitaire';
import { PlayingCard } from './PlayingCard';
import {
  canMoveToFoundation,
  canMoveToTableau,
  getLegalFoundationIndex,
  getLegalTableauIndex,
} from '../utils/solitaireEngine';
import { sound } from '../utils/audio';
import { RotateCcw } from 'lucide-react';

interface GameBoardProps {
  state: SolitaireState;
  cardBack: CardBack;
  tapToMove: boolean;
  activeHint: Hint | null;
  onStockClick: () => void;
  onMoveCards: (source: DragSource, targetType: 'foundation' | 'tableau', targetIndex: number) => boolean;
  onAutoMoveCard: (card: Card, source: DragSource) => boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  state,
  cardBack,
  tapToMove,
  activeHint,
  onStockClick,
  onMoveCards,
  onAutoMoveCard,
}) => {
  // Dragging state
  const [dragSource, setDragSource] = useState<DragSource | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<{ type: 'foundation' | 'tableau'; index: number } | null>(null);

  // Drag start point for threshold detection
  const startPointerRef = useRef<{ x: number; y: number } | null>(null);
  const initialSourceRef = useRef<DragSource | null>(null);

  // Refs for drop detection
  const foundationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableauRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Pointer move / up global listeners
  useEffect(() => {
    if (!dragSource) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!startPointerRef.current) return;
      const dx = e.clientX - startPointerRef.current.x;
      const dy = e.clientY - startPointerRef.current.y;

      if (!isDragging) {
        if (Math.hypot(dx, dy) > 6) {
          setIsDragging(true);
        }
      }

      setDragPos({ x: e.clientX, y: e.clientY });

      // Detect hover target
      const target = getDropTargetAt(e.clientX, e.clientY);
      setHoverTarget(target);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const source = initialSourceRef.current;
      const wasDragging = isDragging;

      // Clean up pointer tracking
      startPointerRef.current = null;
      initialSourceRef.current = null;
      setIsDragging(false);
      setDragSource(null);
      setHoverTarget(null);

      if (!source) return;

      if (wasDragging) {
        // Evaluate drop target
        const dropTarget = getDropTargetAt(e.clientX, e.clientY);
        if (dropTarget) {
          const success = onMoveCards(source, dropTarget.type, dropTarget.index);
          if (!success) {
            sound.playError();
          }
        }
      } else {
        // Was a tap/click!
        if (tapToMove) {
          const card = source.cards[0];
          onAutoMoveCard(card, source);
        }
      }
    };

    const handlePointerCancel = () => {
      startPointerRef.current = null;
      initialSourceRef.current = null;
      setIsDragging(false);
      setDragSource(null);
      setHoverTarget(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [dragSource, isDragging, onMoveCards, onAutoMoveCard, tapToMove]);

  // Find which drop target element contains (x, y)
  const getDropTargetAt = (x: number, y: number): { type: 'foundation' | 'tableau'; index: number } | null => {
    // Check foundations
    for (let i = 0; i < foundationRefs.current.length; i++) {
      const el = foundationRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return { type: 'foundation', index: i };
        }
      }
    }

    // Check tableau columns
    for (let i = 0; i < tableauRefs.current.length; i++) {
      const el = tableauRefs.current[i];
      if (el) {
        const rect = el.getBoundingClientRect();
        // Give tableau column generous bottom boundary
        if (x >= rect.left - 10 && x <= rect.right + 10 && y >= rect.top - 10 && y <= rect.bottom + 120) {
          return { type: 'tableau', index: i };
        }
      }
    }

    return null;
  };

  // Start pointer down on a card
  const handleCardPointerDown = (
    e: React.PointerEvent,
    pileType: 'waste' | 'foundation' | 'tableau',
    pileIndex: number,
    cardIndex: number,
    cards: Card[]
  ) => {
    // Only allow left-clicks or primary touches
    if (e.button !== 0) return;

    const targetEl = e.currentTarget as HTMLElement;
    const rect = targetEl.getBoundingClientRect();

    startPointerRef.current = { x: e.clientX, y: e.clientY };
    const source: DragSource = { pileType, pileIndex, cardIndex, cards };
    initialSourceRef.current = source;
    setDragSource(source);
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  // Double click handler for instant auto-move to foundation
  const handleCardDoubleClick = (card: Card, pileType: 'waste' | 'tableau', pileIndex: number, cardIndex: number) => {
    const fIdx = getLegalFoundationIndex(card, state.foundations);
    if (fIdx !== -1) {
      const source: DragSource = {
        pileType,
        pileIndex,
        cardIndex,
        cards: [card],
      };
      onMoveCards(source, 'foundation', fIdx);
    }
  };

  // Determine if a card is currently hidden because it's being dragged
  const isCardDragged = (pileType: 'waste' | 'foundation' | 'tableau', pileIndex: number, cardIndex: number) => {
    if (!isDragging || !dragSource) return false;
    if (dragSource.pileType !== pileType || dragSource.pileIndex !== pileIndex) return false;
    return cardIndex >= dragSource.cardIndex;
  };

  const suitSymbols = ['♥', '♦', '♣', '♠'];

  return (
    <div className="relative w-full max-w-6xl mx-auto flex-1 flex flex-col justify-start items-center p-2 sm:p-4 md:p-6 select-none overflow-x-hidden">
      {/* Top Row: Stock & Waste on Left, Foundations on Right */}
      <div className="w-full grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        {/* Col 0: Stock Pile */}
        <div className="flex justify-center">
          <div
            onClick={onStockClick}
            className="relative w-16 sm:w-20 md:w-24 lg:w-28 aspect-[2.5/3.5] rounded-lg border-2 border-white/20 bg-black/20 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-inner"
          >
            {state.stock.length > 0 ? (
              <div className="w-full h-full relative">
                <PlayingCard card={state.stock[state.stock.length - 1]} cardBack={cardBack} />
                <span className="absolute bottom-1 right-1.5 bg-black/60 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                  {state.stock.length}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-white/40 hover:text-white/70 transition-colors">
                <RotateCcw className="w-5 sm:w-7 h-5 sm:h-7 stroke-[1.5]" />
                <span className="text-[10px] mt-1 font-mono uppercase">Obróć</span>
              </div>
            )}
          </div>
        </div>

        {/* Col 1: Waste Pile */}
        <div className="flex justify-center">
          <div className="relative w-16 sm:w-20 md:w-24 lg:w-28 aspect-[2.5/3.5] rounded-lg border-2 border-dashed border-white/10 bg-black/10 flex items-center justify-center">
            {state.waste.length > 0 && (
              <div className="relative w-full h-full">
                {state.waste.slice(-3).map((card, idx, arr) => {
                  const isTop = idx === arr.length - 1;
                  const isDragged = isTop && isCardDragged('waste', 0, state.waste.length - 1);
                  const isHinted = activeHint?.sourceType === 'waste' && isTop;

                  return (
                    <div
                      key={card.id}
                      style={{ transform: `translateX(${(idx - (arr.length - 1)) * 12}px)` }}
                      className={`absolute inset-0 ${isDragged ? 'opacity-0' : 'opacity-100'}`}
                    >
                      <PlayingCard
                        card={card}
                        cardBack={cardBack}
                        isHinted={isHinted}
                        onPointerDown={
                          isTop
                            ? (e) =>
                                handleCardPointerDown(e, 'waste', 0, state.waste.length - 1, [card])
                            : undefined
                        }
                        onDoubleClick={
                          isTop
                            ? () => handleCardDoubleClick(card, 'waste', 0, state.waste.length - 1)
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Col 2: Spacer / Empty column between waste and foundations */}
        <div className="hidden sm:block" />

        {/* Col 3, 4, 5, 6: 4 Foundations */}
        {state.foundations.map((foundationPile, fIdx) => {
          const topCard = foundationPile.length > 0 ? foundationPile[foundationPile.length - 1] : null;
          const isTargetHovered = hoverTarget?.type === 'foundation' && hoverTarget.index === fIdx;
          const isTargetHinted = activeHint?.targetType === 'foundation' && activeHint.targetPileIndex === fIdx;
          const isDragged = topCard ? isCardDragged('foundation', fIdx, foundationPile.length - 1) : false;

          return (
            <div key={fIdx} className="flex justify-center">
              <div
                ref={(el) => {
                  foundationRefs.current[fIdx] = el;
                }}
                className={`relative w-16 sm:w-20 md:w-24 lg:w-28 aspect-[2.5/3.5] rounded-lg border-2 transition-all flex items-center justify-center ${
                  isTargetHovered
                    ? 'border-amber-400 bg-amber-400/20 scale-105'
                    : isTargetHinted
                    ? 'border-emerald-400 ring-2 ring-emerald-400/40 animate-pulse'
                    : 'border-white/20 bg-black/20'
                }`}
              >
                {/* Empty slot suit watermark */}
                <span className="text-xl sm:text-2xl text-white/20 select-none pointer-events-none">
                  {suitSymbols[fIdx]}
                </span>

                {topCard && (
                  <div className={`absolute inset-0 ${isDragged ? 'opacity-0' : 'opacity-100'}`}>
                    <PlayingCard
                      card={topCard}
                      cardBack={cardBack}
                      onPointerDown={(e) =>
                        handleCardPointerDown(e, 'foundation', fIdx, foundationPile.length - 1, [topCard])
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row: 7 Tableau Columns */}
      <div className="w-full grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 flex-1 items-start min-h-[360px] pb-16">
        {state.tableau.map((column, colIdx) => {
          const isTargetHovered = hoverTarget?.type === 'tableau' && hoverTarget.index === colIdx;
          const isTargetHinted = activeHint?.targetType === 'tableau' && activeHint.targetPileIndex === colIdx;

          return (
            <div
              key={colIdx}
              ref={(el) => {
                tableauRefs.current[colIdx] = el;
              }}
              className={`flex flex-col items-center min-h-[160px] rounded-lg p-1 transition-all ${
                isTargetHovered
                  ? 'bg-amber-400/15 ring-2 ring-amber-400/50 rounded-xl'
                  : isTargetHinted
                  ? 'bg-emerald-400/10 ring-2 ring-emerald-400/40 rounded-xl animate-pulse'
                  : ''
              }`}
            >
              {column.length === 0 ? (
                /* Empty Column Placeholder for King */
                <div className="w-16 sm:w-20 md:w-24 lg:w-28 aspect-[2.5/3.5] rounded-lg border-2 border-dashed border-white/20 bg-black/10 flex flex-col items-center justify-center text-white/30">
                  <span className="text-xs sm:text-sm font-bold font-display">K</span>
                </div>
              ) : (
                /* Vertical Cascading Card Stack */
                <div className="relative w-16 sm:w-20 md:w-24 lg:w-28">
                  {column.map((card, cardIdx) => {
                    const isDragged = isCardDragged('tableau', colIdx, cardIdx);
                    const isSourceHinted =
                      activeHint?.sourceType === 'tableau' &&
                      activeHint.sourcePileIndex === colIdx &&
                      activeHint.sourceCardIndex === cardIdx;

                    // Calculate vertical offset
                    // Face-down cards overlap more tightly than face-up cards
                    let offsetTop = 0;
                    for (let i = 0; i < cardIdx; i++) {
                      offsetTop += column[i].isFaceUp ? 26 : 14;
                    }

                    return (
                      <div
                        key={card.id}
                        style={{ top: `${offsetTop}px` }}
                        className={`absolute left-0 right-0 ${isDragged ? 'opacity-0' : 'opacity-100'}`}
                      >
                        <PlayingCard
                          card={card}
                          cardBack={cardBack}
                          isHinted={isSourceHinted}
                          onPointerDown={
                            card.isFaceUp
                              ? (e) =>
                                  handleCardPointerDown(
                                    e,
                                    'tableau',
                                    colIdx,
                                    cardIdx,
                                    column.slice(cardIdx)
                                  )
                              : undefined
                          }
                          onDoubleClick={
                            card.isFaceUp && cardIdx === column.length - 1
                              ? () => handleCardDoubleClick(card, 'tableau', colIdx, cardIdx)
                              : undefined
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Drag Overlay attached to Pointer */}
      {isDragging && dragSource && (
        <div
          style={{
            position: 'fixed',
            left: `${dragPos.x - dragOffset.x}px`,
            top: `${dragPos.y - dragOffset.y}px`,
            pointerEvents: 'none',
            zIndex: 999,
          }}
          className="relative transition-none select-none"
        >
          {dragSource.cards.map((card, idx) => (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                top: `${idx * 26}px`,
                left: 0,
              }}
            >
              <PlayingCard card={card} cardBack={cardBack} isDragging={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
