import React, { useState } from 'react';
import type { HandCategory } from '../models/types';
import { strategy, HARD_TOTALS, SOFT_TOTALS, PAIR_TOTALS, DEALER_CARDS } from '../models/StrategyData';

export const ReferenceTab: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<HandCategory>('Hard');

  const getActionColor = (action: string) => {
    switch (action) {
      case 'H': return 'var(--action-hit)';
      case 'S': return 'var(--action-stand)';
      case 'D': return 'var(--action-double)';
      case 'P': return 'var(--action-split)';
      default: return 'var(--text-muted)';
    }
  };

  const getRows = () => {
    switch (selectedSection) {
      case 'Hard': return HARD_TOTALS;
      case 'Soft': return SOFT_TOTALS;
      case 'Pairs': return PAIR_TOTALS;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
      {/* Title */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
        Strategy Chart
      </h2>

      {/* Segmented Picker */}
      <div className="segmented-picker" style={{ marginBottom: '16px', maxWidth: '400px', width: '100%', alignSelf: 'center' }} role="tablist" aria-label="Reference Hand Category">
        {(['Hard', 'Soft', 'Pairs'] as HandCategory[]).map(category => (
          <button
            key={category}
            className={`segmented-picker-item ${selectedSection === category ? 'segmented-picker-item-active' : ''}`}
            onClick={() => setSelectedSection(category)}
            role="tab"
            aria-selected={selectedSection === category}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="legend-dot" style={{ backgroundColor: 'var(--action-hit)' }}></span>
          Hit
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="legend-dot" style={{ backgroundColor: 'var(--action-stand)' }}></span>
          Stand
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="legend-dot" style={{ backgroundColor: 'var(--action-double)' }}></span>
          Double
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="legend-dot" style={{ backgroundColor: 'var(--action-split)' }}></span>
          Split
        </div>
      </div>

      {/* Strategy Table Container */}
      <div
        className="custom-scrollbar"
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingBottom: '20px',
        }}
      >
        <div
          className="strategy-grid"
          style={{
            gridTemplateColumns: `56px repeat(${DEALER_CARDS.length}, 34px)`,
          }}
        >
          {/* Header Row */}
          <div className="strategy-row-label" style={{ background: 'transparent' }}></div>
          {DEALER_CARDS.map(dealer => (
            <div key={dealer} className="strategy-header-cell">
              {dealer}
            </div>
          ))}

          {/* Data Rows */}
          {getRows().map(rowKey => (
            <React.Fragment key={rowKey}>
              {/* Row Label */}
              <div className="strategy-row-label">
                {rowKey}
              </div>
              {/* Cells */}
              {DEALER_CARDS.map(dealer => {
                const action = strategy.getAction(rowKey, dealer, selectedSection);
                return (
                  <div
                    key={`${rowKey}-${dealer}`}
                    className="strategy-cell"
                    style={{ backgroundColor: getActionColor(action) }}
                    title={`${selectedSection} total ${rowKey} vs dealer up-card ${dealer}: ${action}`}
                  >
                    {action}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferenceTab;
