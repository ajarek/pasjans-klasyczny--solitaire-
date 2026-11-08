import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardBack,
  DragSource,
  Hint,
  SolitaireSettings,
  SolitaireStats,
  SolitaireState,
  TableTheme,
} from './types/solitaire';
import {
  canAutoComplete,
  canMoveToFoundation,
  canMoveToTableau,
  checkGameWon,
  findBestHint,
  findNextAutoCompleteMove,
  generateInitialGame,
  getLegalFoundationIndex,
  getLegalTableauIndex,
} from './utils/solitaireEngine';
import { sound } from './utils/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { GameBoard } from './components/GameBoard';
import { WinCanvas } from './components/WinCanvas';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { RulesModal } from './components/RulesModal';

const STATS_STORAGE_KEY = 'pasjans_solitaire_stats_v1';
const SETTINGS_STORAGE_KEY = 'pasjans_solitaire_settings_v1';

const DEFAULT_SETTINGS: SolitaireSettings = {
  drawMode: 1,
  dealType: 'winnable',
  tableTheme: 'emerald',
  cardBack: 'royal-gold',
  soundEnabled: true,
  tapToMove: true,
};

const DEFAULT_STATS: SolitaireStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestScore: 0,
  bestTime: 0,
  currentStreak: 0,
  maxStreak: 0,
};

export default function App() {
  // Screen state
  const [screen, setScreen] = useState<'TITLE_MENU' | 'PLAYING' | 'VICTORY'>('TITLE_MENU');

  // Modals
  const [activeModal, setActiveModal] = useState<'none' | 'settings' | 'stats' | 'rules'>('none');

  // Settings & Stats
  const [settings, setSettings] = useState<SolitaireSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState<SolitaireStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // Current game board state
  const [gameState, setGameState] = useState<SolitaireState>(() =>
    generateInitialGame(DEFAULT_SETTINGS.drawMode, DEFAULT_SETTINGS.dealType)
  );

  // Undo / Redo stacks
  const [undoStack, setUndoStack] = useState<SolitaireState[]>([]);
  const [redoStack, setRedoStack] = useState<SolitaireState[]>([]);

  // Active Hint
  const [activeHint, setActiveHint] = useState<Hint | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);

  // Auto-complete runner ref
  const autoCompleteTimerRef = useRef<number | null>(null);

  // Save settings
  const handleUpdateSettings = (newSettings: Partial<SolitaireSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      if (typeof newSettings.soundEnabled === 'boolean') {
        sound.enabled = newSettings.soundEnabled;
      }
      return updated;
    });
  };

  // Reset stats
  const handleResetStats = () => {
    setStats(DEFAULT_STATS);
    try {
      localStorage.removeItem(STATS_STORAGE_KEY);
    } catch {}
  };

  // Deep clone a game state for undo/redo
  const cloneState = (s: SolitaireState): SolitaireState => ({
    stock: s.stock.map((c) => ({ ...c })),
    waste: s.waste.map((c) => ({ ...c })),
    foundations: s.foundations.map((pile) => pile.map((c) => ({ ...c }))),
    tableau: s.tableau.map((col) => col.map((c) => ({ ...c }))),
    moves: s.moves,
    score: s.score,
    timeSeconds: s.timeSeconds,
    isGameWon: s.isGameWon,
    isAutoCompleting: s.isAutoCompleting,
    drawMode: s.drawMode,
    dealType: s.dealType,
  });

  // Start new game
  const handleStartNewGame = useCallback(() => {
    if (autoCompleteTimerRef.current) {
      clearInterval(autoCompleteTimerRef.current);
      autoCompleteTimerRef.current = null;
    }
    const newGame = generateInitialGame(settings.drawMode, settings.dealType);
    setGameState(newGame);
    setUndoStack([]);
    setRedoStack([]);
    setActiveHint(null);
    setScreen('PLAYING');

    // Update stats: played count
    setStats((prev) => {
      const updated = { ...prev, gamesPlayed: prev.gamesPlayed + 1 };
      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [settings.drawMode, settings.dealType]);

  // Game Timer (only active in PLAYING state)
  useEffect(() => {
    if (screen !== 'PLAYING' || activeModal !== 'none' || gameState.isGameWon) return;

    const timer = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timeSeconds: prev.timeSeconds + 1,
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, activeModal, gameState.isGameWon]);

  // Click Stock Pile (Draw 1 or 3 cards)
  const handleStockClick = () => {
    if (gameState.isAutoCompleting) return;
    setActiveHint(null);

    // Push undo state
    setUndoStack((prev) => [...prev.slice(-49), cloneState(gameState)]);
    setRedoStack([]);

    setGameState((prev) => {
      // If stock has cards, draw according to mode
      if (prev.stock.length > 0) {
        sound.playDeal();
        const drawCount = Math.min(prev.drawMode, prev.stock.length);
        const newStock = [...prev.stock];
        const drawnCards: Card[] = [];

        for (let i = 0; i < drawCount; i++) {
          const card = newStock.pop();
          if (card) {
            drawnCards.push({ ...card, isFaceUp: true });
          }
        }

        return {
          ...prev,
          stock: newStock,
          waste: [...prev.waste, ...drawnCards],
          moves: prev.moves + 1,
        };
      }

      // If stock is empty and waste has cards, recycle waste back to stock
      if (prev.waste.length > 0) {
        sound.playShuffle();
        // Reverse waste and turn all cards face down
        const recycledStock = [...prev.waste].reverse().map((c) => ({ ...c, isFaceUp: false }));
        return {
          ...prev,
          stock: recycledStock,
          waste: [],
          moves: prev.moves + 1,
          score: Math.max(0, prev.score - (prev.drawMode === 1 ? 20 : 10)),
        };
      }

      return prev;
    });
  };

  // Move cards from source to target
  const handleMoveCards = useCallback(
    (source: DragSource, targetType: 'foundation' | 'tableau', targetIndex: number): boolean => {
      if (gameState.isAutoCompleting) return false;
      setActiveHint(null);

      const movingCards = source.cards;
      if (movingCards.length === 0) return false;
      const bottomMovingCard = movingCards[0];

      // 1. Move to Foundation (only 1 card at a time)
      if (targetType === 'foundation') {
        if (movingCards.length > 1) return false;
        const targetPile = gameState.foundations[targetIndex];
        if (!canMoveToFoundation(bottomMovingCard, targetPile)) {
          return false;
        }

        // Legal foundation move!
        setUndoStack((prev) => [...prev.slice(-49), cloneState(gameState)]);
        setRedoStack([]);

        const nextState = cloneState(gameState);

        // Remove from source
        if (source.pileType === 'waste') {
          nextState.waste.pop();
        } else if (source.pileType === 'tableau') {
          nextState.tableau[source.pileIndex].splice(source.cardIndex);
          // Turn top card of source column face-up if needed
          const col = nextState.tableau[source.pileIndex];
          if (col.length > 0 && !col[col.length - 1].isFaceUp) {
            col[col.length - 1].isFaceUp = true;
            nextState.score += 5; // Bonus for uncovering a card
            sound.playFlip();
          }
        } else if (source.pileType === 'foundation') {
          nextState.foundations[source.pileIndex].pop();
        }

        // Add to destination foundation
        nextState.foundations[targetIndex].push(bottomMovingCard);
        nextState.moves += 1;
        nextState.score += 10; // Foundation score

        sound.playSnap();
        sound.playFoundationChime(bottomMovingCard.rank);

        // Check if won!
        if (checkGameWon(nextState.foundations)) {
          nextState.isGameWon = true;
          handleGameWon(nextState);
        }

        setGameState(nextState);
        return true;
      }

      // 2. Move to Tableau
      if (targetType === 'tableau') {
        // Cannot drop onto same column
        if (source.pileType === 'tableau' && source.pileIndex === targetIndex) {
          return false;
        }

        const targetCol = gameState.tableau[targetIndex];
        if (!canMoveToTableau(bottomMovingCard, targetCol)) {
          return false;
        }

        // Legal tableau move!
        setUndoStack((prev) => [...prev.slice(-49), cloneState(gameState)]);
        setRedoStack([]);

        const nextState = cloneState(gameState);

        // Remove from source
        if (source.pileType === 'waste') {
          nextState.waste.pop();
          nextState.score += 5; // Waste to tableau score
        } else if (source.pileType === 'tableau') {
          nextState.tableau[source.pileIndex].splice(source.cardIndex);
          const col = nextState.tableau[source.pileIndex];
          if (col.length > 0 && !col[col.length - 1].isFaceUp) {
            col[col.length - 1].isFaceUp = true;
            nextState.score += 5; // Bonus for uncovering card
            sound.playFlip();
          }
        } else if (source.pileType === 'foundation') {
          nextState.foundations[source.pileIndex].pop();
          nextState.score = Math.max(0, nextState.score - 10);
        }

        // Add to destination column
        nextState.tableau[targetIndex].push(...movingCards);
        nextState.moves += 1;

        sound.playDrop();
        setGameState(nextState);
        return true;
      }

      return false;
    },
    [gameState]
  );

  // Auto-move card on single-click or tap
  const handleAutoMoveCard = useCallback(
    (card: Card, source: DragSource): boolean => {
      // 1. Try moving to foundation first
      const fIdx = getLegalFoundationIndex(card, gameState.foundations);
      if (fIdx !== -1 && source.cards.length === 1) {
        return handleMoveCards(source, 'foundation', fIdx);
      }

      // 2. Try moving to tableau
      const tIdx = getLegalTableauIndex(
        card,
        gameState.tableau,
        source.pileType === 'tableau' ? source.pileIndex : -1
      );
      if (tIdx !== -1) {
        return handleMoveCards(source, 'tableau', tIdx);
      }

      sound.playError();
      return false;
    },
    [gameState, handleMoveCards]
  );

  // Handle game won victory stats
  const handleGameWon = (wonState: SolitaireState) => {
    setStats((prev) => {
      const newPlayed = prev.gamesPlayed;
      const newWon = prev.gamesWon + 1;
      const newBestScore = Math.max(prev.bestScore, wonState.score);
      const newBestTime =
        prev.bestTime === 0
          ? wonState.timeSeconds
          : Math.min(prev.bestTime, wonState.timeSeconds);
      const newStreak = prev.currentStreak + 1;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);

      const updated: SolitaireStats = {
        gamesPlayed: newPlayed,
        gamesWon: newWon,
        bestScore: newBestScore,
        bestTime: newBestTime,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
      };

      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      return updated;
    });

    setScreen('VICTORY');
  };

  // Auto-Complete sequence
  const handleAutoComplete = () => {
    if (!canAutoComplete(gameState)) return;

    sound.playHint();
    setGameState((prev) => ({ ...prev, isAutoCompleting: true }));

    if (autoCompleteTimerRef.current) {
      clearInterval(autoCompleteTimerRef.current);
    }

    autoCompleteTimerRef.current = window.setInterval(() => {
      setGameState((current) => {
        const move = findNextAutoCompleteMove(current);
        if (!move) {
          if (autoCompleteTimerRef.current) {
            clearInterval(autoCompleteTimerRef.current);
            autoCompleteTimerRef.current = null;
          }
          if (checkGameWon(current.foundations)) {
            const finalState = { ...current, isGameWon: true, isAutoCompleting: false };
            handleGameWon(finalState);
            return finalState;
          }
          return { ...current, isAutoCompleting: false };
        }

        const next = cloneState(current);
        const movingCard = next.tableau[move.colIndex].pop()!;
        next.foundations[move.foundationIndex].push(movingCard);
        next.moves += 1;
        next.score += 10;

        sound.playSnap();
        sound.playFoundationChime(movingCard.rank);

        if (checkGameWon(next.foundations)) {
          if (autoCompleteTimerRef.current) {
            clearInterval(autoCompleteTimerRef.current);
            autoCompleteTimerRef.current = null;
          }
          const finalState = { ...next, isGameWon: true, isAutoCompleting: false };
          handleGameWon(finalState);
          return finalState;
        }

        return next;
      });
    }, 180);
  };

  // Undo move
  const handleUndo = () => {
    if (undoStack.length === 0 || gameState.isAutoCompleting) return;
    setActiveHint(null);

    const previousState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, cloneState(gameState)]);
    setGameState(previousState);
    sound.playDrop();
  };

  // Redo move
  const handleRedo = () => {
    if (redoStack.length === 0 || gameState.isAutoCompleting) return;
    setActiveHint(null);

    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, cloneState(gameState)]);
    setGameState(nextState);
    sound.playDrop();
  };

  // Show Hint
  const handleHint = () => {
    if (gameState.isAutoCompleting) return;
    const hint = findBestHint(gameState);
    if (hint) {
      sound.playHint();
      setActiveHint(hint);
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      hintTimeoutRef.current = window.setTimeout(() => {
        setActiveHint(null);
      }, 4500);
    } else {
      sound.playError();
    }
  };

  // Keyboard Shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside modal or input
      if (activeModal !== 'none') {
        if (e.key === 'Escape') {
          setActiveModal('none');
        }
        return;
      }

      if (screen !== 'PLAYING') return;

      // Undo: Ctrl+Z or Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key.toLowerCase() === 'z') {
        handleUndo();
      }
      // Redo: Ctrl+Y or Y
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'y') {
        handleRedo();
      }
      // Hint: H
      else if (e.key.toLowerCase() === 'h') {
        handleHint();
      }
      // Stock draw: Space
      else if (e.code === 'Space') {
        e.preventDefault();
        handleStockClick();
      }
      // New Game: N
      else if (e.key.toLowerCase() === 'n') {
        handleStartNewGame();
      }
      // Sound: M
      else if (e.key.toLowerCase() === 'm') {
        handleUpdateSettings({ soundEnabled: !settings.soundEnabled });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, activeModal, settings.soundEnabled, handleUndo, handleRedo, handleStartNewGame]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      if (autoCompleteTimerRef.current) clearInterval(autoCompleteTimerRef.current);
    };
  }, []);

  // Table background style based on theme
  const getTableBgClass = (theme: TableTheme) => {
    switch (theme) {
      case 'navy':
        return 'bg-felt-navy';
      case 'burgundy':
        return 'bg-felt-burgundy';
      case 'obsidian':
        return 'bg-felt-obsidian';
      case 'emerald':
      default:
        return 'bg-felt-emerald';
    }
  };

  // Render Title Screen
  if (screen === 'TITLE_MENU') {
    return (
      <main className="w-full h-screen">
        <TitleScreen
          settings={settings}
          onStartGame={handleStartNewGame}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenStats={() => setActiveModal('stats')}
          onOpenRules={() => setActiveModal('rules')}
          onUpdateSettings={handleUpdateSettings}
        />

        {activeModal === 'settings' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClose={() => setActiveModal('none')}
          />
        )}
        {activeModal === 'stats' && (
          <StatsModal
            stats={stats}
            onResetStats={handleResetStats}
            onClose={() => setActiveModal('none')}
          />
        )}
        {activeModal === 'rules' && <RulesModal onClose={() => setActiveModal('none')} />}
      </main>
    );
  }

  // Render Active Solitaire Board
  const readyToAutoComplete = canAutoComplete(gameState);

  return (
    <main
      className={`relative w-full h-screen min-h-screen flex flex-col justify-between overflow-hidden select-none ${getTableBgClass(
        settings.tableTheme
      )}`}
    >
      {/* Subtle Felt Texture Vignette */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)]" />

      {/* Perimeter Status & Control HUD */}
      <GameHUD
        score={gameState.score}
        timeSeconds={gameState.timeSeconds}
        moves={gameState.moves}
        canUndo={undoStack.length > 0 && !gameState.isAutoCompleting}
        canRedo={redoStack.length > 0 && !gameState.isAutoCompleting}
        soundEnabled={settings.soundEnabled}
        canAutoComplete={readyToAutoComplete && !gameState.isAutoCompleting}
        hintDescription={activeHint ? activeHint.description : null}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onHint={handleHint}
        onNewGame={handleStartNewGame}
        onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
        onOpenSettings={() => setActiveModal('settings')}
        onOpenStats={() => setActiveModal('stats')}
        onOpenRules={() => setActiveModal('rules')}
        onExitToTitle={() => setScreen('TITLE_MENU')}
        onAutoComplete={handleAutoComplete}
      />

      {/* Main Playfield with Cards, Stock, Waste, Foundations, and Tableau */}
      <GameBoard
        state={gameState}
        cardBack={settings.cardBack}
        tapToMove={settings.tapToMove}
        activeHint={activeHint}
        onStockClick={handleStockClick}
        onMoveCards={handleMoveCards}
        onAutoMoveCard={handleAutoMoveCard}
      />

      {/* Fullscreen 60fps Bouncing Cards Win Celebration */}
      {screen === 'VICTORY' && (
        <WinCanvas
          score={gameState.score}
          moves={gameState.moves}
          timeSeconds={gameState.timeSeconds}
          onPlayAgain={handleStartNewGame}
        />
      )}

      {/* Modals */}
      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setActiveModal('none')}
        />
      )}
      {activeModal === 'stats' && (
        <StatsModal
          stats={stats}
          onResetStats={handleResetStats}
          onClose={() => setActiveModal('none')}
        />
      )}
      {activeModal === 'rules' && <RulesModal onClose={() => setActiveModal('none')} />}
    </main>
  );
}
