import type { PlayResult, HandCategory } from './types';
import type { StatsProvider, AccuracyData } from './WeightedHandGenerator';

const STORAGE_KEY = 'blackjack_statistics_results';
const BUFFER_LIMIT = 1000;

export function loadResults(): PlayResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load statistics results from localStorage:', e);
  }
  return [];
}

export function saveResults(results: PlayResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (e) {
    console.error('Failed to save statistics results to localStorage:', e);
  }
}

export function recordPlayResult(
  results: PlayResult[],
  newResult: Omit<PlayResult, 'id'>
): PlayResult[] {
  const updated = [
    ...results,
    {
      ...newResult,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    },
  ];

  if (updated.length > BUFFER_LIMIT) {
    // Keep only the last 1000 items
    return updated.slice(updated.length - BUFFER_LIMIT);
  }
  return updated;
}

export function getOverallAccuracy(results: PlayResult[]): AccuracyData | null {
  if (results.length === 0) return null;
  const correct = results.filter(r => r.isCorrect).length;
  return { plays: results.length, correct };
}

export function getCategoryAccuracy(results: PlayResult[], category: HandCategory): AccuracyData | null {
  const filtered = results.filter(r => r.handCategory === category);
  if (filtered.length === 0) return null;
  const correct = filtered.filter(r => r.isCorrect).length;
  return { plays: filtered.length, correct };
}

export function getHandAccuracy(results: PlayResult[], category: HandCategory, key: string): AccuracyData | null {
  const filtered = results.filter(r => r.handCategory === category && r.handKey === key);
  if (filtered.length === 0) return null;
  const correct = filtered.filter(r => r.isCorrect).length;
  return { plays: filtered.length, correct };
}

function pairSortValue(key: string): number {
  switch (key) {
    case 'A': return 14;
    case 'T':
    case 'J':
    case 'Q':
    case 'K': return 10;
    default: return parseInt(key, 10) || 0;
  }
}

function getSortKeyValue(key: string, category: HandCategory): number {
  switch (category) {
    case 'Hard':
      return parseInt(key, 10) || 0;
    case 'Soft': {
      const parts = key.split(',');
      return parts.length === 2 ? parseInt(parts[1], 10) || 0 : 0;
    }
    case 'Pairs': {
      const parts = key.split(',');
      const firstCardKey = parts[0] || '';
      return pairSortValue(firstCardKey);
    }
  }
}

export function getAllHandKeys(results: PlayResult[], category: HandCategory): string[] {
  const keysSet = new Set<string>();
  results
    .filter(r => r.handCategory === category)
    .forEach(r => keysSet.add(r.handKey));

  return Array.from(keysSet).sort((a, b) => {
    return getSortKeyValue(a, category) - getSortKeyValue(b, category);
  });
}

export function getReviewableResults(results: PlayResult[], incorrectOnly: boolean): PlayResult[] {
  // Return reversed array (newest first)
  const reversed = [...results].reverse();
  return reversed.filter(r => {
    // Exclude plays that don't have full review data (e.g. dealerKey)
    if (r.dealerKey === undefined) return false;
    return incorrectOnly ? !r.isCorrect : true;
  });
}

// Implement the StatsProvider interface so a list of results can act as a provider
export class ResultsStatsProvider implements StatsProvider {
  private results: PlayResult[];
  constructor(results: PlayResult[]) {
    this.results = results;
  }

  get overallAccuracy(): AccuracyData | null {
    return getOverallAccuracy(this.results);
  }

  handAccuracy(category: HandCategory, key: string): AccuracyData | null {
    return getHandAccuracy(this.results, category, key);
  }
}
