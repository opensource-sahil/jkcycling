import type { Event, Result } from '@/types/event';

export function getLatestResult(events: Event[]): Event | null {
  const withResults = events.filter((e) => (e.results?.length ?? 0) > 0);
  if (withResults.length === 0) return null;
  return withResults.sort((a, b) => +new Date(b.date) - +new Date(a.date))[0];
}

export function getPodium(results: Result[] | undefined): Result[] {
  if (!results) return [];
  return results
    .filter((r) => r.position >= 1 && r.position <= 3)
    .sort((a, b) => a.position - b.position)
    .slice(0, 3);
}
