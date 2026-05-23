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
  const [viewportHeight, setViewportHeight] = React.useState(window.innerHeight);

  React.useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardHeight = Math.max(70, Math.min(viewportHeight * 0.15, 130));
  const isSmallScreen = viewportHeight < 720;
  const isExtraSmallScreen = viewportHeight < 600;

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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: isExtraSmallScreen ? '4px' : (isSmallScreen ? '8px' : '16px') }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isExtraSmallScreen ? '2px' : (isSmallScreen ? '4px' : '8px') }}>
        <div style={{ fontSize: isExtraSmallScreen ? '0.75rem' : (isSmallScreen ? '0.8rem' : '0.9rem'), fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Dealer Shows
        </div>
        <CardComponent card={dealerCard} height={cardHeight} />
      </div>

      {/* Player Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isExtraSmallScreen ? '2px' : (isSmallScreen ? '4px' : '8px'), margin: isExtraSmallScreen ? '4px 0' : (isSmallScreen ? '8px 0' : '20px 0') }}>
        <div style={{ fontSize: isExtraSmallScreen ? '0.75rem' : (isSmallScreen ? '0.8rem' : '0.9rem'), fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Your Hand
        </div>
        <div style={{ display: 'flex', gap: isExtraSmallScreen ? '6px' : (isSmallScreen ? '8px' : '12px'), justifyContent: 'center' }}>
          {playerHand.cards.map((card, idx) => (
            <CardComponent key={`${card.id}-${idx}`} card={card} height={cardHeight} />
          ))}
        </div>
        <div style={{ fontSize: isExtraSmallScreen ? '0.85rem' : (isSmallScreen ? '0.9rem' : '1rem'), fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', marginTop: isExtraSmallScreen ? '2px' : '4px' }}>
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
            margin: isExtraSmallScreen ? '0 auto 4px auto' : (isSmallScreen ? '0 auto 8px auto' : '0 auto 12px auto'),
            padding: isExtraSmallScreen ? '6px 8px' : (isSmallScreen ? '10px 12px' : '16px'),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: `1px solid ${practiceState.correct ? 'var(--action-hit)' : 'var(--action-stand)'}`,
            background: 'rgba(15, 23, 42, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isExtraSmallScreen ? '2px' : (isSmallScreen ? '4px' : '8px') }}>
            <span style={{ fontSize: isExtraSmallScreen ? '1.2rem' : (isSmallScreen ? '1.4rem' : '1.8rem'), color: practiceState.correct ? 'var(--action-hit)' : 'var(--action-stand)', lineHeight: 1 }}>
              {practiceState.correct ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: isExtraSmallScreen ? '0.9rem' : (isSmallScreen ? '1rem' : '1.2rem'), fontWeight: 800, color: practiceState.correct ? 'var(--action-hit)' : 'var(--action-stand)' }}>
              {practiceState.correct ? 'Correct!' : 'Wrong'}
            </span>
          </div>

          {!practiceState.correct && practiceState.correctAction && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: isExtraSmallScreen ? '0.8rem' : (isSmallScreen ? '0.85rem' : '0.95rem'), fontWeight: 600 }}>
                Correct play:{' '}
                <span style={{ color: getActionColor(practiceState.correctAction) }}>
                  {getActionName(practiceState.correctAction)}
                </span>
              </div>
              {practiceState.advice && (
                <p style={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.75rem' : '0.85rem'), color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 0 0' }}>
                  {practiceState.advice}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons / Next Hand Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isSmallScreen ? '10px' : '12px', width: '100%', maxWidth: '320px', margin: '0 auto' }}>
        {practiceState.phase === 'awaitingAction' ? (
          <>
            <div style={{ display: 'flex', gap: isSmallScreen ? '10px' : '12px' }}>
              <button
                onClick={() => onSelectAction('H')}
                className="action-btn action-btn-hit"
              >
                Hit (H)
              </button>
              <button
                onClick={() => onSelectAction('S')}
                className="action-btn action-btn-stand"
              >
                Stand (S)
              </button>
            </div>
            <div style={{ display: 'flex', gap: isSmallScreen ? '10px' : '12px' }}>
              <button
                onClick={() => onSelectAction('D')}
                className="action-btn action-btn-double"
              >
                Double (D)
              </button>
              <button
                onClick={() => onSelectAction('P')}
                disabled={!canSplit}
                className="action-btn action-btn-split"
              >
                Split (P)
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onNextHand}
            className="next-hand-btn"
          >
            Next Hand (Space/N)
          </button>
        )}
      </div>
    </div>
  );
};

export default PracticeTab;
