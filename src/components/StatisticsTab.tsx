import React, { useState } from 'react';
import type { PlayResult } from '../models/types';
import {
  getOverallAccuracy,
  getCategoryAccuracy,
  getHandAccuracy,
  getAllHandKeys,
} from '../models/StatisticsStore';

interface StatisticsTabProps {
  results: PlayResult[];
  onResetStats: () => void;
  onNavigateToReview: () => void;
}

export const StatisticsTab: React.FC<StatisticsTabProps> = ({
  results,
  onResetStats,
  onNavigateToReview,
}) => {
  const [showingResetAlert, setShowingResetAlert] = useState(false);

  const formatAccuracy = (accuracy: { plays: number; correct: number } | null) => {
    if (!accuracy || accuracy.plays === 0) return '—';
    const pct = Math.round((accuracy.correct / accuracy.plays) * 100);
    return `${pct}%`;
  };

  const getPlaysText = (accuracy: { plays: number; correct: number } | null) => {
    if (!accuracy) return '';
    return `${accuracy.plays} play${accuracy.plays === 1 ? '' : 's'}`;
  };

  const renderAccuracyRow = (
    label: string,
    accuracy: { plays: number; correct: number } | null,
    isSubRow = false
  ) => {
    return (
      <div
        className="stats-row"
        style={{
          padding: isSubRow ? '10px 16px' : '14px 16px',
          background: isSubRow ? 'rgba(255,255,255,0.04)' : 'var(--glass-bg)',
          marginLeft: isSubRow ? '12px' : '0',
          borderLeft: isSubRow ? '3px solid rgba(255,255,255,0.15)' : '1px solid var(--glass-border)',
        }}
      >
        <span style={{ fontWeight: isSubRow ? 500 : 600, fontSize: isSubRow ? '0.9rem' : '1rem' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {accuracy && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {getPlaysText(accuracy)}
            </span>
          )}
          <span
            style={{
              fontWeight: 700,
              fontSize: isSubRow ? '0.9rem' : '1rem',
              color: accuracy ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'monospace',
              minWidth: '40px',
              textAlign: 'right',
            }}
          >
            {formatAccuracy(accuracy)}
          </span>
        </div>
      </div>
    );
  };

  const hardKeys = getAllHandKeys(results, 'Hard');
  const softKeys = getAllHandKeys(results, 'Soft');
  const pairKeys = getAllHandKeys(results, 'Pairs');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '20px 16px 80px 16px', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Statistics</h2>
        <button
          onClick={() => setShowingResetAlert(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      {/* Review Section Link */}
      <button
        onClick={onNavigateToReview}
        className="glass-card glass-card-interactive"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--border-radius-md)',
          padding: '16px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          marginBottom: '24px',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Magnifying Glass Icon Representation */}
          <span style={{ fontSize: '1.2rem', color: '#10b981' }}>🔍</span>
          <span style={{ fontWeight: 600 }}>Review Recent Hands</span>
        </div>
        <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>➔</span>
      </button>

      {/* Overall Section */}
      <div style={{ marginBottom: '20px' }}>
        <div className="stats-category-title">Overall</div>
        {renderAccuracyRow('All Hands', getOverallAccuracy(results))}
      </div>

      {/* By Category Section */}
      <div style={{ marginBottom: '20px' }}>
        <div className="stats-category-title">By Category</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {renderAccuracyRow('Hard Totals', getCategoryAccuracy(results, 'Hard'))}
          {renderAccuracyRow('Soft Totals', getCategoryAccuracy(results, 'Soft'))}
          {renderAccuracyRow('Pairs', getCategoryAccuracy(results, 'Pairs'))}
        </div>
      </div>

      {/* Detailed Hand-By-Hand Section */}
      {(hardKeys.length > 0 || softKeys.length > 0 || pairKeys.length > 0) && (
        <div style={{ marginBottom: '20px' }}>
          <div className="stats-category-title">Detailed Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {hardKeys.length > 0 && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '12px' }}>Hard Totals</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {hardKeys.map(key => (
                    <React.Fragment key={key}>
                      {renderAccuracyRow(key, getHandAccuracy(results, 'Hard', key), true)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {softKeys.length > 0 && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '12px' }}>Soft Totals</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {softKeys.map(key => (
                    <React.Fragment key={key}>
                      {renderAccuracyRow(key, getHandAccuracy(results, 'Soft', key), true)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {pairKeys.length > 0 && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '12px' }}>Pairs</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pairKeys.map(key => (
                    <React.Fragment key={key}>
                      {renderAccuracyRow(key, getHandAccuracy(results, 'Pairs', key), true)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog Overlay */}
      {showingResetAlert && (
        <div className="feedback-overlay" onClick={() => setShowingResetAlert(false)}>
          <div className="feedback-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '340px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Reset Statistics</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '24px' }}>
              All statistics data will be cleared. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button
                onClick={() => setShowingResetAlert(false)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetStats();
                  setShowingResetAlert(false);
                }}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsTab;
