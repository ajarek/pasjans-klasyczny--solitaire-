export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type CardColor = 'red' | 'black';

export interface Card {
  id: string; // e.g. "hearts_1", "spades_13"
  suit: Suit;
  rank: number; // 1 (Ace) to 13 (King)
  isFaceUp: boolean;
}

export type PileType = 'stock' | 'waste' | 'foundation' | 'tableau';

export interface DragSource {
  pileType: PileType;
  pileIndex: number; // index of foundation (0-3) or tableau (0-6)
  cardIndex: number; // index of the dragged card in its pile
  cards: Card[]; // the dragged card plus any cards stacked on top
}

export interface SolitaireState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // 4 piles: 0=hearts, 1=diamonds, 2=clubs, 3=spades (or suit-matched)
  tableau: Card[][]; // 7 piles
  moves: number;
  score: number;
  timeSeconds: number;
  isGameWon: boolean;
  isAutoCompleting: boolean;
  drawMode: 1 | 3;
  dealType: 'random' | 'winnable';
}

export interface Hint {
  sourceType: PileType;
  sourcePileIndex: number;
  sourceCardIndex: number;
  targetType: PileType;
  targetPileIndex: number;
  card: Card;
  description: string;
}

export type TableTheme = 'emerald' | 'navy' | 'burgundy' | 'obsidian';

export type CardBack = 'royal-gold' | 'vintage-blue' | 'ruby-filigree' | 'modern-dark';

export interface SolitaireStats {
  gamesPlayed: number;
  gamesWon: number;
  bestScore: number;
  bestTime: number; // in seconds, 0 = none
  currentStreak: number;
  maxStreak: number;
}

export interface SolitaireSettings {
  drawMode: 1 | 3;
  dealType: 'random' | 'winnable';
  tableTheme: TableTheme;
  cardBack: CardBack;
  soundEnabled: boolean;
  tapToMove: boolean;
}
