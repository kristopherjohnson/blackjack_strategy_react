import React from 'react';
import type { Card } from '../models/types';
import { getRankDisplay, getSuitSymbol, getSuitColor } from '../models/Card';

interface CardComponentProps {
  card: Card;
  height?: number;
}

export const CardComponent: React.FC<CardComponentProps> = ({ card, height = 140 }) => {
  const width = height * 0.7;
  const color = getSuitColor(card.suit);
  const symbol = getSuitSymbol(card.suit);
  const displayVal = getRankDisplay(card.rank);

  const valueFontSize = `${Math.max(height * 0.16, 12)}px`;
  const symbolFontSize = `${Math.max(height * 0.12, 10)}px`;
  const bigSymbolFontSize = `${Math.max(height * 0.28, 24)}px`;

  const getRankName = (rank: number): string => {
    switch (rank) {
      case 11: return 'Jack';
      case 12: return 'Queen';
      case 13: return 'King';
      case 14: return 'Ace';
      default: return `${rank}`;
    }
  };

  const getSuitName = (suit: string): string => {
    return suit.charAt(0).toUpperCase() + suit.slice(1);
  };

  const cardDescription = `${getRankName(card.rank)} of ${getSuitName(card.suit)}`;

  return (
    <div
      className="playing-card"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        color: color,
        padding: `${height * 0.08}px`,
        borderRadius: `${height * 0.07}px`,
      }}
      role="img"
      aria-label={cardDescription}
    >
      {/* Top Left Corner */}
      <div className="playing-card-corner" style={{ alignSelf: 'flex-start' }} aria-hidden="true">
        <span style={{ fontSize: valueFontSize, fontWeight: 800 }}>{displayVal}</span>
        <span style={{ fontSize: symbolFontSize, marginTop: '-2px' }}>{symbol}</span>
      </div>

      {/* Center Big Symbol */}
      <div
        className="playing-card-suit-big"
        style={{
          fontSize: bigSymbolFontSize,
          color: color,
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        {symbol}
      </div>

      {/* Bottom Right Corner (inverted) */}
      <div
        className="playing-card-corner"
        style={{
          alignSelf: 'flex-end',
          transform: 'rotate(180deg)',
        }}
        aria-hidden="true"
      >
        <span style={{ fontSize: valueFontSize, fontWeight: 800 }}>{displayVal}</span>
        <span style={{ fontSize: symbolFontSize, marginTop: '-2px' }}>{symbol}</span>
      </div>
    </div>
  );
};

export default CardComponent;
