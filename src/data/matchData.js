import { getSettings } from './settings';
import iplSchedule from './ipl_schedule.json';

// Local pricing logic based on venue/team
export const getPriceForVenue = (venue) => {
  if (venue?.includes('Chidambaram')) return 1500;
  if (venue?.includes('Chinnaswamy')) return 2000;
  if (venue?.includes('Modi')) return 1200;
  if (venue?.includes('Gandhi')) return 800;
  return 1000; // Default price
};

/**
 * Returns the upcoming IPL 2026 matches from the local static cache.
 * Automatically filters out matches that have already occurred (prior to today).
 */
export const getIplMatches = () => {
  try {
    // Current date threshold (March 31, 2026 as per system context)
    const now = new Date(); 
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const enrichedMatches = iplSchedule
      .filter(match => {
        const matchDate = new Date(match.date);
        return matchDate >= startOfToday;
      })
      .map(match => ({
        ...match,
        ticketPrice: getPriceForVenue(match.venue || '')
      }));
    return enrichedMatches;
  } catch (error) {
    console.warn("[MATCH_DATA] Error loading or filtering cached schedule:", error);
    return [];
  }
};

export const getMatchById = (id) => {
  const matches = getIplMatches();
  return matches.find(m => m.id === id) || null;
};
