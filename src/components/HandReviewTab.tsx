import React, { useState } from 'react';
import type { PlayResult, PlayerAction } from '../models/types';
import { PlayerActionDisplay } from '../models/types';
import { getReviewableResults } from '../models/StatisticsStore';

interface HandReviewTabProps {
  results: PlayResult[];
  onBack: () => void;
}

type FilterType = 'Incorrect' | 'All';

export const HandReviewTab: React.FC<HandReviewTabProps> = ({ results, onBack }) => {
  const [filter, setFilter] = useState<FilterType>('Incorrect');

  const reviewable = getReviewableResults(results, filter === 'Incorrect');

  const getHandDescription = (result: PlayResult) => {
    let categoryText = '';
    switch (result.handCategory) {
      case 'Hard':
        categoryText = `Hard ${result.handKey}`;
        break;
      case 'Soft':
        categoryText = `Soft ${result.handKey}`;
        break;
      case 'Pairs':
        categoryText = `Pair ${result.handKey}`;
        break;
    }

    if (result.dealerKey) {
      return `${categoryText} vs dealer ${result.dealerKey}`;
    }
    return categoryText;
  };

  const getActionName = (actionCode?: string) => {
    if (!actionCode) return '—';
    return PlayerActionDisplay[actionCode as PlayerAction] || actionCode;
  };

  const getActionColor = (actionCode?: string) => {
    switch (actionCode) {
      case 'H': return 'var(--action-hit)';
      case 'S': return 'var(--action-stand)';
      case 'D': return 'var(--action-double)';
      case 'P': return 'var(--action-split)';
      default: return 'var(--text-muted)';
    }
  };

  const getEmptyDescription = () => {
    if (filter === 'Incorrect') {
      return "You haven't made any mistakes in recent plays. Keep practicing!";
    } else {
      return 'Play some hands in Practice mode to review them here.';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 16px 80px 16px', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#10b981',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            position: 'absolute',
            left: 0,
          }}
        >
          <span>◀</span> Back
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 auto' }}>Hand Review</h2>
      </div>

      {/* Segmented Filter */}
      <div className="segmented-picker" style={{ marginBottom: '20px', width: '100%' }}>
        {(['Incorrect', 'All'] as FilterType[]).map(f => (
          <button
            key={f}
            className={`segmented-picker-item ${filter === f ? 'segmented-picker-item-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List / Empty State */}
      {reviewable.length === 0 ? (
        <div
          className="glass-card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            textAlign: 'center',
            marginTop: '20px',
            gap: '16px',
            borderRadius: 'var(--border-radius-md)',
          }}
        >
          <span style={{ fontSize: '3rem', color: '#10b981' }}>✓</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {filter === 'Incorrect' ? 'No Incorrect Plays' : 'No Plays to Review'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {getEmptyDescription()}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
          {reviewable.map((result) => (
            <div
              key={result.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '16px',
                borderRadius: 'var(--border-radius-md)',
              }}
            >
              {/* Header: Hand vs Dealer & Correct Icon */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {getHandDescription(result)}
                </span>
                <span
                  style={{
                    fontSize: '1.2rem',
                    color: result.isCorrect ? 'var(--action-hit)' : 'var(--action-stand)',
                    fontWeight: 'bold',
                  }}
                >
                  {result.isCorrect ? '✓' : '✗'}
                </span>
              </div>

              {/* Played vs Correct Columns */}
              <div style={{ display: 'flex', gap: '24px' }}>
                {/* Player played */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    You Played
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: getActionColor(result.playerAction) }}>
                    {getActionName(result.playerAction)}
                  </span>
                </div>
                {/* Correct Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Correct
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: getActionColor(result.correctAction) }}>
                    {getActionName(result.correctAction)}
                  </span>
                </div>
              </div>

              {/* Strategy advice */}
              {!result.isCorrect && result.advice && (
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '8px',
                    marginTop: '4px',
                  }}
                >
                  {result.advice}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HandReviewTab;
