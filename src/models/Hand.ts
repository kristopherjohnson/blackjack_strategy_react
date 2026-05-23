import type { Hand } from './types';
import { getRankBlackjackValue, getRankStrategyKey, getRandomCard } from './Card';

export function isHandPair(hand: Hand): boolean {
  return hand.cards.length === 2 && hand.cards[0].rank === hand.cards[1].rank;
}

export function getHandHardTotal(hand: Hand): number {
  return hand.cards.reduce((sum, card) => {
    return sum + (card.rank === 14 ? 1 : getRankBlackjackValue(card.rank));
  }, 0);
}

export function isHandSoft(hand: Hand): boolean {
  const hardTotal = getHandHardTotal(hand);
  const hasAce = hand.cards.some(card => card.rank === 14);
  return hardTotal <= 11 && hasAce;
}

export function getHandBestTotal(hand: Hand): number {
  return isHandSoft(hand) ? getHandHardTotal(hand) + 10 : getHandHardTotal(hand);
}

export function isHandBlackjack(hand: Hand): boolean {
  return hand.cards.length === 2 && getHandBestTotal(hand) === 21;
}

export function getHandStrategyKey(hand: Hand): string {
  if (isHandPair(hand)) {
    const value = getRankStrategyKey(hand.cards[0].rank);
    return `${value},${value}`;
  } else if (isHandSoft(hand)) {
    // Non-ace total plus extra aces (counted as 1)
    let nonAceTotal = 0;
    let aceCount = 0;
    for (const card of hand.cards) {
      if (card.rank === 14) {
        aceCount++;
      } else {
        nonAceTotal += getRankBlackjackValue(card.rank);
      }
    }
    const otherValue = nonAceTotal + (aceCount - 1);
    return `A,${otherValue}`;
  } else {
    return `${getHandBestTotal(hand)}`;
  }
}

export function getRandomTwoCardHand(): Hand {
  let hand: Hand;
  do {
    hand = { cards: [getRandomCard(), getRandomCard()] };
  } while (isHandBlackjack(hand));
  return hand;
}
