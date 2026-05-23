export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string; // e.g. "A♠", "10♦"
}

export interface Hand {
  cards: Card[];
}

export type PlayerAction = 'H' | 'S' | 'D' | 'P';

export const PlayerActionDisplay: Record<PlayerAction, string> = {
  H: 'Hit',
  S: 'Stand',
  D: 'Double',
  P: 'Split',
};

export type HandCategory = 'Hard' | 'Soft' | 'Pairs';

export interface PlayResult {
  id: string; // UUID equivalent
  handCategory: HandCategory;
  handKey: string;
  isCorrect: boolean;
  dealerKey?: string;
  playerAction?: string;
  correctAction?: string;
  advice?: string;
}

export type PracticeMode = 'Random' | 'Weighted';

export interface StrategyEntry {
  action: string;
  advice: string;
}

export interface StrategyJSON {
  hard: Record<string, Record<string, StrategyEntry>>;
  soft: Record<string, Record<string, StrategyEntry>>;
  pairs: Record<string, Record<string, StrategyEntry>>;
}

export type PracticePhase = 'awaitingAction' | 'showingResult';

export interface PracticeState {
  phase: PracticePhase;
  correct?: boolean;
  correctAction?: PlayerAction;
  advice?: string;
}
