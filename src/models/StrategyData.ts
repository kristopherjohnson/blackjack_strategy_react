import type { PlayerAction, HandCategory, StrategyEntry, StrategyJSON } from './types';
import rawStrategyData from '../assets/strategy.json';

const strategyData = rawStrategyData as StrategyJSON;

export const HARD_TOTALS = ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
export const SOFT_TOTALS = ['A,2', 'A,3', 'A,4', 'A,5', 'A,6', 'A,7', 'A,8', 'A,9'];
export const PAIR_TOTALS = ['2,2', '3,3', '4,4', '5,5', '6,6', '7,7', '8,8', '9,9', '10,10', 'A,A'];
export const DEALER_CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];

export class StrategyData {
  private data: StrategyJSON = strategyData;

  getCorrectAction(handKey: string, dealerKey: string, isPair: boolean, isSoft: boolean): PlayerAction {
    const type = this.handType(isPair, isSoft);
    const entry = this.getEntry(handKey, dealerKey, type);
    const actionStr = entry?.action || 'S';
    return actionStr as PlayerAction;
  }

  getAdvice(handKey: string, dealerKey: string, isPair: boolean, isSoft: boolean): string {
    const type = this.handType(isPair, isSoft);
    const entry = this.getEntry(handKey, dealerKey, type);
    return entry?.advice || 'Follow basic strategy.';
  }

  getAction(forHand: string, dealer: string, type: HandCategory): string {
    const entry = this.getEntry(forHand, dealer, type);
    return entry?.action || '?';
  }

  private handType(isPair: boolean, isSoft: boolean): HandCategory {
    if (isPair) return 'Pairs';
    if (isSoft) return 'Soft';
    return 'Hard';
  }

  private getEntry(hand: string, dealer: string, type: HandCategory): StrategyEntry | undefined {
    switch (type) {
      case 'Hard':
        return this.data.hard[hand]?.[dealer];
      case 'Soft':
        return this.data.soft[hand]?.[dealer];
      case 'Pairs':
        return this.data.pairs[hand]?.[dealer];
    }
  }
}

export const strategy = new StrategyData();
export default strategy;
