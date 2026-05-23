import type { Card, Hand, HandCategory, Rank } from './types';
import { createCard, getRandomCard, RANKS, SUITS } from './Card';
import { getHandStrategyKey, isHandBlackjack, isHandPair, isHandSoft, getRandomTwoCardHand } from './Hand';

export interface AccuracyData {
  plays: number;
  correct: number;
}

export interface StatsProvider {
  overallAccuracy: AccuracyData | null;
  handAccuracy(category: HandCategory, key: string): AccuracyData | null;
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
      c => c.category === selectedEntry.category && c.key === selectedEntry.key
    );

    if (!comboEntry || comboEntry.combos.length === 0) {
      return {
        hand: getRandomTwoCardHand(),
        dealerCard: getRandomCard(),
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
      dealerCard: getRandomCard(),
    };
  }

  computeWeights(stats: StatsProvider): Array<{ category: HandCategory; key: string; weight: number }> {
    return this.comboTable.map(entry => {
      const accuracy = stats.handAccuracy(entry.category, entry.key);
      let weight = 1.0;

      if (accuracy && accuracy.plays >= WeightedHandGenerator.perHandPlayThreshold) {
        const rate = accuracy.correct / accuracy.plays;
        // Inverse accuracy weighting: lower accuracy -> higher weight
        weight = Math.max(0.2, 1.0 - rate) + 0.1;
      }

      return {
        category: entry.category,
        key: entry.key,
        weight,
      };
    });
  }
}

export const weightedHandGenerator = new WeightedHandGenerator();
export default weightedHandGenerator;
