import React from 'react';
import type { Card, Hand, PlayerAction, PracticeMode, PracticeState } from '../models/types';
import CardComponent from './CardComponent';
import { getHandBestTotal, isHandPair, isHandSoft } from '../models/Hand';

interface PracticeTabProps {
  playerHand: Hand;
  dealerCard: Card;
  practiceState: PracticeState;
  practiceMode: PracticeMode;
  setPracticeMode: (mode: PracticeMode) => void;
  onSelectAction: (action: PlayerAction) => void;
  onNextHand: () => void;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({
  playerHand,
  dealerCard,
  practiceState,
  practiceMode,
  setPracticeMode,
  onSelectAction,
  onNextHand,
}) => {
  const canSplit = isHandPair(playerHand);

  // Description of player hand (e.g. "Soft 17", "Pair (16)", "Hard 12")
  const getHandDescription = () => {
    const total = getHandBestTotal(playerHand);
    if (isHandPair(playerHand)) {
      return `Pair (${total})`;
    } else if (isHandSoft(playerHand)) {
      return `Soft ${total}`;
    } else {
      return `Hard ${total}`;
    }
  };

  const getActionColor = (action: PlayerAction) => {
    switch (action) {
      case 'H': return 'var(--action-hit)';
      case 'S': return 'var(--action-stand)';
      case 'D': return 'var(--action-double)';
      case 'P': return 'var(--action-split)';
    }
  };

  const getActionName = (action: PlayerAction) => {
    switch (action) {
      case 'H': return 'Hit';
      case 'S': return 'Stand';
      case 'D': return 'Double';
      case 'P': return 'Split';
    }
  };

  return (
    <div className="felt-table">
      {/* Top Header Mode Selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div className="segmented-picker" style={{ width: '180px' }}>
          <button
            className={`segmented-picker-item ${practiceMode === 'Random' ? 'segmented-picker-item-active' : ''}`}
            onClick={() => setPracticeMode('Random')}
          >
            Random
          </button>
          <button
            className={`segmented-picker-item ${practiceMode === 'Weighted' ? 'segmented-picker-item-active' : ''}`}
            onClick={() => setPracticeMode('Weighted')}
          >
            Weighted
          </button>
        </div>
      </div>

      {/* Dealer Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Dealer Shows
        </div>
        <CardComponent card={dealerCard} height={130} />
      </div>

      {/* Player Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '20px 0' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your Hand
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {playerHand.cards.map((card, idx) => (
            <CardComponent key={`${card.id}-${idx}`} card={card} height={130} />
          ))}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>
          {getHandDescription()}
        </div>
      </div>

      {/* Feedback Card */}
      {practiceState.phase === 'showingResult' && (
        <div
          className="glass-card"
          style={{
            maxWidth: '320px',
            width: '100%',
            margin: '0 auto 12px auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: `1px solid ${practiceState.correct ? 'var(--action-hit)' : 'var(--action-stand)'}`,
            background: 'rgba(15, 23, 42, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.8rem', color: practiceState.correct ? 'var(--action-hit)' : 'var(--action-stand)', lineHeight: 1 }}>
              {practiceState.correct ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: practiceState.correct ? 'var(--action-hit)' : 'var(--action-stand)' }}>
              {practiceState.correct ? 'Correct!' : 'Wrong'}
            </span>
          </div>

          {!practiceState.correct && practiceState.correctAction && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                Correct play:{' '}
                <span style={{ color: getActionColor(practiceState.correctAction) }}>
                  {getActionName(practiceState.correctAction)}
                </span>
              </div>
              {practiceState.advice && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 0 0' }}>
                  {practiceState.advice}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons / Next Hand Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
        {practiceState.phase === 'awaitingAction' ? (
          <>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => onSelectAction('H')}
                className="action-btn"
                style={{
                  flex: 1,
                  height: '50px',
                  borderRadius: '10px',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--action-hit)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Hit (H)
              </button>
              <button
                onClick={() => onSelectAction('S')}
                className="action-btn"
                style={{
                  flex: 1,
                  height: '50px',
                  borderRadius: '10px',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--action-stand)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Stand (S)
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => onSelectAction('D')}
                className="action-btn"
                style={{
                  flex: 1,
                  height: '50px',
                  borderRadius: '10px',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--action-double)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Double (D)
              </button>
              <button
                onClick={() => onSelectAction('P')}
                disabled={!canSplit}
                className="action-btn"
                style={{
                  flex: 1,
                  height: '50px',
                  borderRadius: '10px',
                  border: 'none',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--action-split)',
                  opacity: canSplit ? 1 : 0.4,
                  cursor: canSplit ? 'pointer' : 'not-allowed',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                  transition: 'transform 0.1s ease, opacity 0.2s ease',
                }}
                onMouseDown={(e) => canSplit && (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => canSplit && (e.currentTarget.style.transform = 'scale(1)')}
              >
                Split (P)
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onNextHand}
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '10px',
              border: 'none',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700,
              backgroundColor: '#10b981', // Emerald 500
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Next Hand (Space/N)
          </button>
        )}
      </div>
    </div>
  );
};

export default PracticeTab;
