// Client-side helper that calls the secure Next.js API route
import { Item, MatchSuggestion } from '../types';

export const findSmartMatches = async (targetItem: Item, candidates: Item[]): Promise<MatchSuggestion[]> => {
  if (!targetItem || candidates.length === 0) return [];

  try {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetItem, candidates })
    });

    if (!res.ok) {
      console.error('Gemini Matching Error: API route failed', res.status);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Gemini Matching Error:", error);
    return [];
  }
};