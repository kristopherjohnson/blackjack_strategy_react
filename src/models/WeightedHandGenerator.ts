import type { Card, Hand, HandCategory, Rank } from './types';
import { createCard, getRandomCard, getRandomCardForDealerKey, RANKS, SUITS } from './Card';
import { getHandStrategyKey, isHandBlackjack, isHandPair, isHandSoft, getRandomTwoCardHand } from './Hand';

export interface AccuracyData {
  plays: number;
  correct: number;
}

export interface StatsProvider {
  overallAccuracy: AccuracyData | null;
  handAccuracy(category: HandCategory, key: string): AccuracyData | null;
  combinationAccuracy(category: HandCategory, handKey: string, dealerKey: string): AccuracyData | null;
}

export interface RankCombo {
  rank1: Rank;
  rank2: Rank;
}

export interface ComboEntry {
  category: HandCategory;
  key: string;
  combos: RankCombo[];
}

export const DEALER_KEYS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

export interface ComboWeightEntry {
  category: HandCategory;
  handKey: string;
  dealerKey: string;
  weight: number;
}

export class WeightedHandGenerator {
  static readonly globalPlayThreshold = 20;
  static readonly perHandPlayThreshold = 10;

  readonly comboTable: ComboEntry[];

  constructor() {
    const table: Record<string, { category: HandCategory; combos: RankCombo[] }> = {};

    for (const r1 of RANKS) {
      for (const r2 of RANKS) {
        if (r2 >= r1) {
          // Build a temporary hand to classify it
          const card1 = createCard(r1, 'spades');
          const card2 = createCard(r2, 'hearts');
          const hand: Hand = { cards: [card1, card2] };

          // Skip blackjacks
          if (isHandBlackjack(hand)) continue;

          const key = getHandStrategyKey(hand);
          const category: HandCategory = isHandPair(hand)
            ? 'Pairs'
            : isHandSoft(hand)
            ? 'Soft'
            : 'Hard';

          // Use category+key as the lookup to handle overlaps (like "10" in hard and pairs)
          const tableKey = `${category}:${key}`;
          if (!table[tableKey]) {
            table[tableKey] = { category, combos: [] };
          }
          table[tableKey].combos.push({ rank1: r1, rank2: r2 });
        }
      }
    }

    this.comboTable = Object.entries(table).map(([tableKey, value]) => {
      const key = tableKey.substring(tableKey.indexOf(':') + 1);
      return {
        category: value.category,
        key,
        combos: value.combos,
      };
    });
  }

  generateHand(stats: StatsProvider): { hand: Hand; dealerCard: Card } {
    const overall = stats.overallAccuracy;
    if (!overall || overall.plays < WeightedHandGenerator.globalPlayThreshold) {
      return {
        hand: getRandomTwoCardHand(),
        dealerCard: getRandomCard(),
      };
    }

    // Compute weights
    const weights = this.computeWeights(stats);
    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);

    // Weighted random selection
    const roll = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedEntry = weights[0];

    for (const item of weights) {
      cumulative += item.weight;
      if (roll < cumulative) {
        selectedEntry = item;
        break;
      }
    }

    // Find the combo entry for this key
    const comboEntry = this.comboTable.find(
      c => c.category === selectedEntry.category && c.key === selectedEntry.handKey
    );

    if (!comboEntry || comboEntry.combos.length === 0) {
      return {
        hand: getRandomTwoCardHand(),
        dealerCard: getRandomCardForDealerKey(selectedEntry.dealerKey),
      };
    }

    // Pick a random combo and assign random suits
    const combo = comboEntry.combos[Math.floor(Math.random() * comboEntry.combos.length)];
    const suit1 = SUITS[Math.floor(Math.random() * SUITS.length)];
    const suit2 = SUITS[Math.floor(Math.random() * SUITS.length)];

    // Randomly swap card order
    const card1 = createCard(combo.rank1, suit1);
    const card2 = createCard(combo.rank2, suit2);
    const cards = Math.random() < 0.5 ? [card1, card2] : [card2, card1];

    return {
      hand: { cards },
      dealerCard: getRandomCardForDealerKey(selectedEntry.dealerKey),
    };
  }

  computeWeights(stats: StatsProvider): ComboWeightEntry[] {
    const list: ComboWeightEntry[] = [];
    for (const entry of this.comboTable) {
      for (const dealerKey of DEALER_KEYS) {
        const accuracy = stats.combinationAccuracy(entry.category, entry.key, dealerKey);
        let weight = 1.0;

        if (accuracy && accuracy.plays > 0) {
          const incorrect = accuracy.plays - accuracy.correct;
          if (incorrect > 0) {
            const rate = accuracy.correct / accuracy.plays;
            // Higher weight for lower accuracy, and direct boost based on number of incorrect attempts
            weight = 1.0 + (1.0 - rate) * 2.0 + incorrect * 1.5;
          } else {
            // Lower weight if they always got it correct
            weight = 0.1;
          }
        }

        list.push({
          category: entry.category,
          handKey: entry.key,
          dealerKey,
          weight,
        });
      }
    }
    return list;
  }
}

export const weightedHandGenerator = new WeightedHandGenerator();
export default weightedHandGenerator;
