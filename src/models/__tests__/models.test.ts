import { describe, it, expect } from 'vitest';
import { createCard, getRankBlackjackValue, getRankStrategyKey, getRankDisplay, getRandomCardForDealerKey } from '../Card';
import {
  isHandPair,
  isHandSoft,
  getHandHardTotal,
  getHandBestTotal,
  isHandBlackjack,
  getHandStrategyKey,
} from '../Hand';
import { strategy } from '../StrategyData';
import { recordPlayResult, getOverallAccuracy, getCategoryAccuracy, getHandAccuracy, getAllHandKeys, getCombinationAccuracy } from '../StatisticsStore';
import { WeightedHandGenerator } from '../WeightedHandGenerator';
import type { PlayResult } from '../types';

describe('Card Helper Functions', () => {
  it('should calculate correct blackjack values', () => {
    expect(getRankBlackjackValue(2)).toBe(2);
    expect(getRankBlackjackValue(9)).toBe(9);
    expect(getRankBlackjackValue(10)).toBe(10);
    expect(getRankBlackjackValue(11)).toBe(10); // Jack
    expect(getRankBlackjackValue(12)).toBe(10); // Queen
    expect(getRankBlackjackValue(13)).toBe(10); // King
    expect(getRankBlackjackValue(14)).toBe(11); // Ace
  });

  it('should generate correct strategy keys', () => {
    expect(getRankStrategyKey(2)).toBe('2');
    expect(getRankStrategyKey(9)).toBe('9');
    expect(getRankStrategyKey(10)).toBe('10');
    expect(getRankStrategyKey(11)).toBe('10'); // Jack -> 10
    expect(getRankStrategyKey(12)).toBe('10'); // Queen -> 10
    expect(getRankStrategyKey(13)).toBe('10'); // King -> 10
    expect(getRankStrategyKey(14)).toBe('A');  // Ace -> A
  });

  it('should display correct rank symbols', () => {
    expect(getRankDisplay(2)).toBe('2');
    expect(getRankDisplay(10)).toBe('10');
    expect(getRankDisplay(11)).toBe('J');
    expect(getRankDisplay(12)).toBe('Q');
    expect(getRankDisplay(13)).toBe('K');
    expect(getRankDisplay(14)).toBe('A');
  });
});

describe('Hand Calculation Helpers', () => {
  it('should classify pair hands correctly', () => {
    const hand1 = { cards: [createCard(8, 'hearts'), createCard(8, 'spades')] };
    const hand2 = { cards: [createCard(8, 'hearts'), createCard(9, 'spades')] };
    expect(isHandPair(hand1)).toBe(true);
    expect(isHandPair(hand2)).toBe(false);
  });

  it('should classify soft hands correctly', () => {
    const hand1 = { cards: [createCard(14, 'hearts'), createCard(6, 'spades')] }; // Ace, 6
    const hand2 = { cards: [createCard(8, 'hearts'), createCard(6, 'spades')] };  // 8, 6
    const hand3 = { cards: [createCard(14, 'hearts'), createCard(14, 'spades')] }; // Ace, Ace
    expect(isHandSoft(hand1)).toBe(true);
    expect(isHandSoft(hand2)).toBe(false);
    expect(isHandSoft(hand3)).toBe(true);
  });

  it('should calculate hand totals correctly', () => {
    const hand1 = { cards: [createCard(14, 'hearts'), createCard(6, 'spades')] }; // Ace, 6
    expect(getHandHardTotal(hand1)).toBe(7); // 1 + 6
    expect(getHandBestTotal(hand1)).toBe(17); // 11 + 6

    const hand2 = { cards: [createCard(10, 'hearts'), createCard(13, 'spades')] }; // 10, King
    expect(getHandHardTotal(hand2)).toBe(20);
    expect(getHandBestTotal(hand2)).toBe(20);
  });

  it('should check for natural blackjacks', () => {
    const hand1 = { cards: [createCard(14, 'hearts'), createCard(10, 'spades')] }; // Ace, 10
    const hand2 = { cards: [createCard(14, 'hearts'), createCard(14, 'spades')] }; // Ace, Ace
    const hand3 = { cards: [createCard(14, 'hearts'), createCard(5, 'spades'), createCard(5, 'clubs')] }; // Ace, 5, 5
    expect(isHandBlackjack(hand1)).toBe(true);
    expect(isHandBlackjack(hand2)).toBe(false);
    expect(isHandBlackjack(hand3)).toBe(false); // Blackjack must be 2 cards
  });

  it('should generate correct strategy keys', () => {
    const handPair = { cards: [createCard(8, 'hearts'), createCard(8, 'spades')] };
    expect(getHandStrategyKey(handPair)).toBe('8,8');

    const handSoft = { cards: [createCard(14, 'hearts'), createCard(6, 'spades')] };
    expect(getHandStrategyKey(handSoft)).toBe('A,6');

    const handHard = { cards: [createCard(10, 'hearts'), createCard(6, 'spades')] };
    expect(getHandStrategyKey(handHard)).toBe('16');
  });
});

describe('Strategy Database Lookup', () => {
  it('should load strategy.json and perform correct lookups', () => {
    // Hard 16 vs Dealer 10 -> Hit (H)
    expect(strategy.getCorrectAction('16', '10', false, false)).toBe('H');
    expect(strategy.getAdvice('16', '10', false, false)).toContain('Hit 13-16 vs dealer 7+');

    // Soft 18 vs Dealer 9 -> Hit (H)
    expect(strategy.getCorrectAction('A,7', '9', false, true)).toBe('H');

    // Pairs 8s vs Dealer 10 -> Split (P)
    expect(strategy.getCorrectAction('8,8', '10', true, false)).toBe('P');
    expect(strategy.getAdvice('8,8', '10', true, false)).toContain('Always split 8s');
  });
});

describe('Statistics Store Selectors', () => {
  it('should record plays and compute correct statistics', () => {
    let list: PlayResult[] = [];
    list = recordPlayResult(list, {
      handCategory: 'Hard',
      handKey: '16',
      isCorrect: true,
      dealerKey: '10',
      playerAction: 'H',
      correctAction: 'H',
    });

    list = recordPlayResult(list, {
      handCategory: 'Hard',
      handKey: '16',
      isCorrect: false,
      dealerKey: '10',
      playerAction: 'S',
      correctAction: 'H',
    });

    list = recordPlayResult(list, {
      handCategory: 'Soft',
      handKey: 'A,7',
      isCorrect: true,
      dealerKey: '2',
      playerAction: 'S',
      correctAction: 'S',
    });

    expect(list.length).toBe(3);
    expect(getOverallAccuracy(list)).toEqual({ plays: 3, correct: 2 });
    expect(getCategoryAccuracy(list, 'Hard')).toEqual({ plays: 2, correct: 1 });
    expect(getCategoryAccuracy(list, 'Soft')).toEqual({ plays: 1, correct: 1 });
    expect(getCategoryAccuracy(list, 'Pairs')).toBeNull();
    expect(getHandAccuracy(list, 'Hard', '16')).toEqual({ plays: 2, correct: 1 });
  });

  it('should sort hand keys correctly by category', () => {
    let list: PlayResult[] = [];
    list = recordPlayResult(list, { handCategory: 'Hard', handKey: '16', isCorrect: true });
    list = recordPlayResult(list, { handCategory: 'Hard', handKey: '5', isCorrect: true });
    list = recordPlayResult(list, { handCategory: 'Hard', handKey: '12', isCorrect: true });

    list = recordPlayResult(list, { handCategory: 'Soft', handKey: 'A,7', isCorrect: true });
    list = recordPlayResult(list, { handCategory: 'Soft', handKey: 'A,2', isCorrect: true });

    list = recordPlayResult(list, { handCategory: 'Pairs', handKey: 'A,A', isCorrect: true });
    list = recordPlayResult(list, { handCategory: 'Pairs', handKey: '8,8', isCorrect: true });
    list = recordPlayResult(list, { handCategory: 'Pairs', handKey: '10,10', isCorrect: true });

    expect(getAllHandKeys(list, 'Hard')).toEqual(['5', '12', '16']);
    expect(getAllHandKeys(list, 'Soft')).toEqual(['A,2', 'A,7']);
    expect(getAllHandKeys(list, 'Pairs')).toEqual(['8,8', '10,10', 'A,A']);
  });
});

describe('Weighted Hand Generator', () => {
  it('should precompute combination table successfully', () => {
    const generator = new WeightedHandGenerator();
    expect(generator.comboTable.length).toBeGreaterThan(0);

    // Verify 8,8 maps to pairs category
    const entry88 = generator.comboTable.find(c => c.category === 'Pairs' && c.key === '8,8');
    expect(entry88).toBeDefined();
    expect(entry88?.combos.length).toBeGreaterThan(0);
  });

  it('should compute combination weights based on incorrect history', () => {
    const generator = new WeightedHandGenerator();
    
    // Mock a stats provider
    const mockStats = {
      overallAccuracy: { plays: 25, correct: 20 },
      handAccuracy: () => null,
      combinationAccuracy: (category: string, handKey: string, dealerKey: string) => {
        // Assume user struggled with Hard 16 vs Dealer 10
        if (category === 'Hard' && handKey === '16' && dealerKey === '10') {
          return { plays: 3, correct: 1 }; // 2 incorrect
        }
        // Assume user is perfect with Hard 17 vs Dealer 6
        if (category === 'Hard' && handKey === '17' && dealerKey === '6') {
          return { plays: 4, correct: 4 }; // 0 incorrect
        }
        return null;
      }
    };

    const weights = generator.computeWeights(mockStats);
    
    // Find weight for Hard 16 vs Dealer 10 (should be boosted)
    const weight16v10 = weights.find(w => w.category === 'Hard' && w.handKey === '16' && w.dealerKey === '10');
    expect(weight16v10).toBeDefined();
    // 1.0 + (1.0 - 1/3) * 2.0 + 2 * 1.5 = 1.0 + 1.33 + 3.0 = 5.33
    expect(weight16v10!.weight).toBeCloseTo(5.33);

    // Find weight for Hard 17 vs Dealer 6 (should be low/reduced)
    const weight17v6 = weights.find(w => w.category === 'Hard' && w.handKey === '17' && w.dealerKey === '6');
    expect(weight17v6).toBeDefined();
    expect(weight17v6!.weight).toBe(0.1);

    // Find weight for an unplayed hand combination (should be 1.0)
    const weightUnplayed = weights.find(w => w.category === 'Hard' && w.handKey === '12' && w.dealerKey === '2');
    expect(weightUnplayed).toBeDefined();
    expect(weightUnplayed!.weight).toBe(1.0);
  });

  it('should generate hand and dealer card matching weighted strategy', () => {
    const generator = new WeightedHandGenerator();
    
    const mockStats = {
      overallAccuracy: { plays: 50, correct: 10 },
      handAccuracy: () => null,
      combinationAccuracy: (category: string, handKey: string, dealerKey: string) => {
        // High incorrect count for Soft A,7 vs Dealer 9
        if (category === 'Soft' && handKey === 'A,7' && dealerKey === '9') {
          return { plays: 20, correct: 0 };
        }
        // Always correct on everything else to ensure Soft A,7 vs 9 gets selected
        return { plays: 10, correct: 10 };
      }
    };

    const result = generator.generateHand(mockStats);
    expect(result.hand).toBeDefined();
    expect(result.dealerCard).toBeDefined();
    expect(getHandStrategyKey(result.hand)).toBe('A,7');
    expect(result.dealerCard.rank).toBe(9); // dealerKey '9' maps to rank 9
  });
});

describe('Dealer Card Key Generator', () => {
  it('should generate correct ranks for all dealer card keys', () => {
    const cardA = getRandomCardForDealerKey('A');
    expect(cardA.rank).toBe(14);

    const card10 = getRandomCardForDealerKey('10');
    expect([10, 11, 12, 13]).toContain(card10.rank);

    const card5 = getRandomCardForDealerKey('5');
    expect(card5.rank).toBe(5);
  });
});

describe('Statistics Store Combination Accuracy', () => {
  it('should compute combination accuracy correctly', () => {
    let list: PlayResult[] = [];
    list = recordPlayResult(list, {
      handCategory: 'Hard',
      handKey: '16',
      isCorrect: false,
      dealerKey: '10',
    });
    list = recordPlayResult(list, {
      handCategory: 'Hard',
      handKey: '16',
      isCorrect: true,
      dealerKey: '10',
    });
    list = recordPlayResult(list, {
      handCategory: 'Hard',
      handKey: '16',
      isCorrect: true,
      dealerKey: '2',
    });

    const acc16v10 = getCombinationAccuracy(list, 'Hard', '16', '10');
    expect(acc16v10).toEqual({ plays: 2, correct: 1 });

    const acc16v2 = getCombinationAccuracy(list, 'Hard', '16', '2');
    expect(acc16v2).toEqual({ plays: 1, correct: 1 });

    const accUnplayed = getCombinationAccuracy(list, 'Hard', '16', '7');
    expect(accUnplayed).toBeNull();
  });
});
