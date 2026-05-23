import { describe, it, expect } from 'vitest';
import { createCard, getRankBlackjackValue, getRankStrategyKey, getRankDisplay } from '../Card';
import {
  isHandPair,
  isHandSoft,
  getHandHardTotal,
  getHandBestTotal,
  isHandBlackjack,
  getHandStrategyKey,
} from '../Hand';
import { strategy } from '../StrategyData';
import { recordPlayResult, getOverallAccuracy, getCategoryAccuracy, getHandAccuracy, getAllHandKeys } from '../StatisticsStore';
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
});
