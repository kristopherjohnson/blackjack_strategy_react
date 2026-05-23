import type { Suit, Rank, Card } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
}

export function getSuitColor(suit: Suit): string {
  switch (suit) {
    case 'hearts':
    case 'diamonds':
      return '#ef4444'; // Red (Tailored HSL equivalent red-500)
    case 'clubs':
    case 'spades':
      return '#1f2937'; // Slate grey/black (slate-800)
  }
}

export function getRankDisplay(rank: Rank): string {
  switch (rank) {
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    case 14: return 'A';
    default: return `${rank}`;
  }
}

export function getRankBlackjackValue(rank: Rank): number {
  if (rank === 14) return 11; // Ace
  if (rank >= 10) return 10;   // 10, J, Q, K
  return rank;
}

export function getRankStrategyKey(rank: Rank): string {
  if (rank === 14) return 'A';
  if (rank >= 10) return '10';
  return `${rank}`;
}

export function createCard(rank: Rank, suit: Suit): Card {
  return {
    rank,
    suit,
    id: `${getRankDisplay(rank)}${getSuitSymbol(suit)}`,
  };
}

export function getRandomCard(): Card {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return createCard(rank, suit);
}
