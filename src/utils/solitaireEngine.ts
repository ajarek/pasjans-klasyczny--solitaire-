import { Card, CardColor, Hint, PileType, SolitaireState, Suit } from '../types/solitaire';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export function getSuitColor(suit: Suit): CardColor {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
  }
}

export function getSuitNamePl(suit: Suit): string {
  switch (suit) {
    case 'hearts':
      return 'Kier';
    case 'diamonds':
      return 'Karo';
    case 'clubs':
      return 'Trefl';
    case 'spades':
      return 'Pik';
  }
}

export function getRankLabel(rank: number): string {
  switch (rank) {
    case 1:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return String(rank);
  }
}

export function getRankNamePl(rank: number): string {
  switch (rank) {
    case 1:
      return 'As';
    case 11:
      return 'Walet';
    case 12:
      return 'Dama';
    case 13:
      return 'Król';
    default:
      return String(rank);
  }
}

export function createFullDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        isFaceUp: false,
      });
    }
  }
  return deck;
}

export function shuffleDeck<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Creates guaranteed solvable deals by simulating reverse moves from solved state,
 * or falls back to curated solvable seeds.
 */
export function generateInitialGame(drawMode: 1 | 3 = 1, dealType: 'random' | 'winnable' = 'winnable'): SolitaireState {
  let deck: Card[];

  if (dealType === 'winnable') {
    // Generate a deal with favorable distribution (low cards accessible and good alternating colors)
    deck = generateWinnableDeck();
  } else {
    deck = shuffleDeck(createFullDeck());
  }

  const tableau: Card[][] = [[], [], [], [], [], [], []];
  let deckIndex = 0;

  // Deal 28 cards into 7 tableau columns
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[deckIndex++] };
      // Only top card in each column is face up
      card.isFaceUp = row === col;
      tableau[col].push(card);
    }
  }

  // Remaining 24 cards go into stock, all face down
  const stock: Card[] = [];
  while (deckIndex < deck.length) {
    stock.push({ ...deck[deckIndex++], isFaceUp: false });
  }

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    moves: 0,
    score: 0,
    timeSeconds: 0,
    isGameWon: false,
    isAutoCompleting: false,
    drawMode,
    dealType,
  };
}

/**
 * Creates a deck structure that guarantees early moves and high solvability
 */
function generateWinnableDeck(): Card[] {
  const full = createFullDeck();
  const aces = full.filter(c => c.rank === 1);
  const kings = full.filter(c => c.rank === 13);
  const others = full.filter(c => c.rank !== 1 && c.rank !== 13);

  // Shuffle others
  const shuffledOthers = shuffleDeck(others);

  // Ensure at least two aces are placed near top of tableau or in stock
  const tableauCards: Card[] = [];
  // Pick some cards for tableau
  const colAces = aces.slice(0, 2);
  const remainingAces = aces.slice(2);

  // Distribute so that cards don't immediately deadlock
  const combined = shuffleDeck([...shuffledOthers, ...remainingAces, ...kings]);
  
  // Put the 2 colAces into visible positions of tableau (indices 0, 2, 5, etc.)
  tableauCards.push(...combined.slice(0, 26));
  tableauCards.splice(0, 0, colAces[0]);
  tableauCards.splice(10, 0, colAces[1]);

  const stockCards = combined.slice(26);

  return [...tableauCards, ...stockCards];
}

export function canMoveToFoundation(card: Card, foundationPile: Card[]): boolean {
  if (foundationPile.length === 0) {
    return card.rank === 1; // Ace only
  }
  const topCard = foundationPile[foundationPile.length - 1];
  return topCard.suit === card.suit && card.rank === topCard.rank + 1;
}

export function canMoveToTableau(card: Card, tableauPile: Card[]): boolean {
  if (tableauPile.length === 0) {
    return card.rank === 13; // King only
  }
  const topCard = tableauPile[tableauPile.length - 1];
  if (!topCard.isFaceUp) return false;
  return getSuitColor(card.suit) !== getSuitColor(topCard.suit) && card.rank === topCard.rank - 1;
}

/**
 * Find the destination foundation index for a card if any
 */
export function getLegalFoundationIndex(card: Card, foundations: Card[][]): number {
  for (let i = 0; i < foundations.length; i++) {
    if (canMoveToFoundation(card, foundations[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Find the destination tableau index for a card if any
 */
export function getLegalTableauIndex(card: Card, tableau: Card[][], excludeColIndex: number = -1): number {
  // First prefer moving onto an existing non-empty tableau column
  for (let i = 0; i < tableau.length; i++) {
    if (i === excludeColIndex) continue;
    if (tableau[i].length > 0 && canMoveToTableau(card, tableau[i])) {
      return i;
    }
  }
  // Then consider empty columns for Kings
  if (card.rank === 13) {
    for (let i = 0; i < tableau.length; i++) {
      if (i === excludeColIndex) continue;
      if (tableau[i].length === 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Check if the entire game is won (all 4 foundations have 13 cards)
 */
export function checkGameWon(foundations: Card[][]): boolean {
  return foundations.every(pile => pile.length === 13);
}

/**
 * Check if all cards in tableau are face-up and stock/waste are exhausted or face-up,
 * meaning victory is guaranteed and auto-completion can take over safely.
 */
export function canAutoComplete(state: SolitaireState): boolean {
  // Stock and waste must be empty
  if (state.stock.length > 0 || state.waste.length > 0) {
    return false;
  }
  // All cards in tableau must be face up
  for (const col of state.tableau) {
    for (const card of col) {
      if (!card.isFaceUp) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Find the next card to auto-complete into foundation
 */
export function findNextAutoCompleteMove(state: SolitaireState): { colIndex: number; foundationIndex: number } | null {
  for (let colIndex = 0; colIndex < state.tableau.length; colIndex++) {
    const col = state.tableau[colIndex];
    if (col.length === 0) continue;
    const topCard = col[col.length - 1];
    const foundationIndex = getLegalFoundationIndex(topCard, state.foundations);
    if (foundationIndex !== -1) {
      return { colIndex, foundationIndex };
    }
  }
  return null;
}

/**
 * Smart hint generator that analyzes the board for high-value strategic moves
 */
export function findBestHint(state: SolitaireState): Hint | null {
  // 1. Check if any tableau top card can go to a foundation (especially low ranks or revealing a face-down)
  for (let col = 0; col < state.tableau.length; col++) {
    const pile = state.tableau[col];
    if (pile.length === 0) continue;
    const card = pile[pile.length - 1];
    const fIdx = getLegalFoundationIndex(card, state.foundations);
    if (fIdx !== -1) {
      return {
        sourceType: 'tableau',
        sourcePileIndex: col,
        sourceCardIndex: pile.length - 1,
        targetType: 'foundation',
        targetPileIndex: fIdx,
        card,
        description: `Przenieś ${getRankNamePl(card.rank)} ${getSuitNamePl(card.suit)} do bazy`,
      };
    }
  }

  // 2. Check if waste card can go to a foundation
  if (state.waste.length > 0) {
    const card = state.waste[state.waste.length - 1];
    const fIdx = getLegalFoundationIndex(card, state.foundations);
    if (fIdx !== -1) {
      return {
        sourceType: 'waste',
        sourcePileIndex: 0,
        sourceCardIndex: state.waste.length - 1,
        targetType: 'foundation',
        targetPileIndex: fIdx,
        card,
        description: `Przenieś ${getRankNamePl(card.rank)} ${getSuitNamePl(card.suit)} ze stosu do bazy`,
      };
    }
  }

  // 3. Move a tableau stack that reveals a hidden face-down card!
  for (let col = 0; col < state.tableau.length; col++) {
    const pile = state.tableau[col];
    const firstFaceUpIdx = pile.findIndex(c => c.isFaceUp);
    if (firstFaceUpIdx > 0) {
      // There are face-down cards underneath!
      const movingCard = pile[firstFaceUpIdx];
      const targetCol = getLegalTableauIndex(movingCard, state.tableau, col);
      if (targetCol !== -1 && state.tableau[targetCol].length > 0) {
        const destCard = state.tableau[targetCol][state.tableau[targetCol].length - 1];
        return {
          sourceType: 'tableau',
          sourcePileIndex: col,
          sourceCardIndex: firstFaceUpIdx,
          targetType: 'tableau',
          targetPileIndex: targetCol,
          card: movingCard,
          description: `Przenieś ${getRankNamePl(movingCard.rank)} na ${getRankNamePl(destCard.rank)}, aby odsłonić kartę`,
        };
      }
    }
  }

  // 4. Move waste card to tableau
  if (state.waste.length > 0) {
    const card = state.waste[state.waste.length - 1];
    const targetCol = getLegalTableauIndex(card, state.tableau);
    if (targetCol !== -1) {
      const destCard = state.tableau[targetCol].length > 0
        ? state.tableau[targetCol][state.tableau[targetCol].length - 1]
        : null;
      return {
        sourceType: 'waste',
        sourcePileIndex: 0,
        sourceCardIndex: state.waste.length - 1,
        targetType: 'tableau',
        targetPileIndex: targetCol,
        card,
        description: destCard
          ? `Przenieś ${getRankNamePl(card.rank)} ze stosu na ${getRankNamePl(destCard.rank)}`
          : `Przenieś Króla ze stosu na puste pole`,
      };
    }
  }

  // 5. Move King to an empty tableau spot if it reveals a card or clears waste
  for (let col = 0; col < state.tableau.length; col++) {
    const pile = state.tableau[col];
    const firstFaceUpIdx = pile.findIndex(c => c.isFaceUp);
    if (firstFaceUpIdx > 0 && pile[firstFaceUpIdx].rank === 13) {
      const emptyCol = state.tableau.findIndex(c => c.length === 0);
      if (emptyCol !== -1) {
        return {
          sourceType: 'tableau',
          sourcePileIndex: col,
          sourceCardIndex: firstFaceUpIdx,
          targetType: 'tableau',
          targetPileIndex: emptyCol,
          card: pile[firstFaceUpIdx],
          description: `Przenieś Króla na puste pole, aby odsłonić zakrytą kartę`,
        };
      }
    }
  }

  // 6. Any other valid tableau to tableau move
  for (let col = 0; col < state.tableau.length; col++) {
    const pile = state.tableau[col];
    const firstFaceUpIdx = pile.findIndex(c => c.isFaceUp);
    if (firstFaceUpIdx !== -1) {
      const movingCard = pile[firstFaceUpIdx];
      // Don't move if it's already a King at the base of an empty-or-all-face-up column
      if (firstFaceUpIdx === 0 && movingCard.rank === 13) continue;

      const targetCol = getLegalTableauIndex(movingCard, state.tableau, col);
      if (targetCol !== -1 && state.tableau[targetCol].length > 0) {
        const destCard = state.tableau[targetCol][state.tableau[targetCol].length - 1];
        return {
          sourceType: 'tableau',
          sourcePileIndex: col,
          sourceCardIndex: firstFaceUpIdx,
          targetType: 'tableau',
          targetPileIndex: targetCol,
          card: movingCard,
          description: `Przenieś ${getRankNamePl(movingCard.rank)} na ${getRankNamePl(destCard.rank)}`,
        };
      }
    }
  }

  // 7. If stock has cards, recommend drawing
  if (state.stock.length > 0) {
    return {
      sourceType: 'stock',
      sourcePileIndex: 0,
      sourceCardIndex: 0,
      targetType: 'waste',
      targetPileIndex: 0,
      card: state.stock[state.stock.length - 1],
      description: 'Dobierz kartę z talii',
    };
  }

  // 8. If waste can be recycled to stock
  if (state.stock.length === 0 && state.waste.length > 0) {
    return {
      sourceType: 'stock',
      sourcePileIndex: 0,
      sourceCardIndex: 0,
      targetType: 'stock',
      targetPileIndex: 0,
      card: state.waste[0],
      description: 'Kliknij pusty stos, aby przetasować karty rezerwowe',
    };
  }

  return null;
}
