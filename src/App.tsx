import { useState, useEffect } from 'react';
import { Spade, BookOpen, BarChart3 } from 'lucide-react';
import type { Hand, Card, PlayerAction, PracticeMode, PracticeState, PlayResult } from './models/types';
import { getRandomCard } from './models/Card';
import { getRandomTwoCardHand, getHandStrategyKey, isHandPair, isHandSoft } from './models/Hand';
import { strategy } from './models/StrategyData';
import { weightedHandGenerator } from './models/WeightedHandGenerator';
import { loadResults, saveResults, recordPlayResult, ResultsStatsProvider } from './models/StatisticsStore';
import PracticeTab from './components/PracticeTab';
import ReferenceTab from './components/ReferenceTab';
import StatisticsTab from './components/StatisticsTab';
import HandReviewTab from './components/HandReviewTab';

type Tab = 'practice' | 'reference' | 'statistics' | 'review';

function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<Tab>('practice');
  // Statistics Results
  const [results, setResults] = useState<PlayResult[]>([]);

  // Practice round states
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('Random');
  const [playerHand, setPlayerHand] = useState<Hand>({ cards: [] });
  const [dealerCard, setDealerCard] = useState<Card>({ rank: 2, suit: 'hearts', id: '2♥' });
  const [practiceState, setPracticeState] = useState<PracticeState>({ phase: 'awaitingAction' });

  // Initialize stats and first hand on mount
  useEffect(() => {
    // Load results
    const savedResults = loadResults();
    setResults(savedResults);

    // Load practice mode preference
    const savedMode = localStorage.getItem('blackjack_practice_mode');
    const initialMode: PracticeMode = savedMode === 'Weighted' ? 'Weighted' : 'Random';
    setPracticeMode(initialMode);

    // Initial hand deal
    if (initialMode === 'Weighted') {
      const { hand, dealerCard: initialDealer } = weightedHandGenerator.generateHand(
        new ResultsStatsProvider(savedResults)
      );
      setPlayerHand(hand);
      setDealerCard(initialDealer);
    } else {
      setPlayerHand(getRandomTwoCardHand());
      setDealerCard(getRandomCard());
    }
  }, []);

  // Keyboard shortcuts listener for practice gameplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'practice') return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      if (practiceState.phase === 'awaitingAction') {
        if (key === 'h') {
          handleSelectAction('H');
        } else if (key === 's') {
          handleSelectAction('S');
        } else if (key === 'd') {
          handleSelectAction('D');
        } else if (key === 'p' && isHandPair(playerHand)) {
          handleSelectAction('P');
        }
      } else if (practiceState.phase === 'showingResult') {
        if (e.key === ' ' || e.key === 'Enter' || ['h', 's', 'd', 'p', 'n'].includes(key)) {
          e.preventDefault(); // Prevent page scroll on spacebar
          handleNextHand();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab, practiceState.phase, playerHand, dealerCard, results, practiceMode]);

  // Update practice mode preference
  const handlePracticeModeChange = (mode: PracticeMode) => {
    setPracticeMode(mode);
    localStorage.setItem('blackjack_practice_mode', mode);
  };

  // Perform basic strategy check and record
  const handleSelectAction = (action: PlayerAction) => {
    const correctAction = strategy.getCorrectAction(
      getHandStrategyKey(playerHand),
      getDealerCardKey(dealerCard),
      isHandPair(playerHand),
      isHandSoft(playerHand)
    );

    const advice = strategy.getAdvice(
      getHandStrategyKey(playerHand),
      getDealerCardKey(dealerCard),
      isHandPair(playerHand),
      isHandSoft(playerHand)
    );

    const isCorrect = action === correctAction;

    // Determine category
    const category = isHandPair(playerHand) ? 'Pairs' : isHandSoft(playerHand) ? 'Soft' : 'Hard';

    // Record the result
    const newResults = recordPlayResult(results, {
      handCategory: category,
      handKey: getHandStrategyKey(playerHand),
      isCorrect,
      dealerKey: getDealerCardKey(dealerCard),
      playerAction: action,
      correctAction: correctAction,
      advice,
    });

    setResults(newResults);
    saveResults(newResults);

    // Transition state
    setPracticeState({
      phase: 'showingResult',
      correct: isCorrect,
      correctAction,
      advice,
    });
  };

  // Deal next hand
  const handleNextHand = () => {
    if (practiceMode === 'Weighted') {
      const { hand, dealerCard: nextDealer } = weightedHandGenerator.generateHand(
        new ResultsStatsProvider(results)
      );
      setPlayerHand(hand);
      setDealerCard(nextDealer);
    } else {
      setPlayerHand(getRandomTwoCardHand());
      setDealerCard(getRandomCard());
    }
    setPracticeState({ phase: 'awaitingAction' });
  };

  // Reset statistics data
  const handleResetStats = () => {
    setResults([]);
    saveResults([]);
  };

  // Helper: dealer upcard key format
  function getDealerCardKey(card: Card): string {
    if (card.rank === 14) return 'A';
    if (card.rank >= 10) return '10';
    return `${card.rank}`;
  }

  // Render current tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'practice':
        if (!playerHand.cards || playerHand.cards.length === 0) return null;
        return (
          <PracticeTab
            playerHand={playerHand}
            dealerCard={dealerCard}
            practiceState={practiceState}
            practiceMode={practiceMode}
            setPracticeMode={handlePracticeModeChange}
            onSelectAction={handleSelectAction}
            onNextHand={handleNextHand}
          />
        );
      case 'reference':
        return <ReferenceTab />;
      case 'statistics':
        return (
          <StatisticsTab
            results={results}
            onResetStats={handleResetStats}
            onNavigateToReview={() => setActiveTab('review')}
          />
        );
      case 'review':
        return <HandReviewTab results={results} onBack={() => setActiveTab('statistics')} />;
    }
  };

  return (
    <div className="app-container">
      {/* Scrollable screen content */}
      <div className="screen-content">{renderTabContent()}</div>

      {/* Floating Bottom Tab Bar */}
      {activeTab !== 'review' && (
        <nav className="bottom-nav">
          <button
            onClick={() => setActiveTab('practice')}
            className={`nav-item ${activeTab === 'practice' ? 'nav-item-active' : ''}`}
          >
            <Spade className="nav-icon" size={24} />
            <span>Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('reference')}
            className={`nav-item ${activeTab === 'reference' ? 'nav-item-active' : ''}`}
          >
            <BookOpen className="nav-icon" size={24} />
            <span>Reference</span>
          </button>

          <button
            onClick={() => setActiveTab('statistics')}
            className={`nav-item ${activeTab === 'statistics' ? 'nav-item-active' : ''}`}
          >
            <BarChart3 className="nav-icon" size={24} />
            <span>Statistics</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
