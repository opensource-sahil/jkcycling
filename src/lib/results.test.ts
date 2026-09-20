import { describe, it, expect } from 'vitest';
import { getLatestResult, getPodium } from './results';
import type { Event, Result } from '@/types/event';

const ev = (id: string, date: string, results?: Result[]): Event => ({
  id, title: id, date, district: 'X', type: 'Road', description: '', location: '',
  image: '', categories: [], registration: { isOpen: false }, status: 'COMPLETED',
  audit: { createdAt: '', updatedAt: '' }, results,
});
const r = (position: number, name: string, time: string): Result => ({ position, name, time, category: 'Open' });

describe('getLatestResult', () => {
  it('returns the most recent event that has results', () => {
    const events = [ev('a', '2026-01-01', [r(1, 'A', '1:00')]), ev('b', '2026-05-01', [r(1, 'B', '2:00')]), ev('c', '2026-06-01')];
    expect(getLatestResult(events)?.id).toBe('b');
  });
  it('returns null when no event has results', () => {
    expect(getLatestResult([ev('a', '2026-01-01'), ev('b', '2026-02-01', [])])).toBeNull();
  });
});

describe('getPodium', () => {
  it('returns positions 1-3 sorted', () => {
    const podium = getPodium([r(3, 'C', '3'), r(1, 'A', '1'), r(2, 'B', '2'), r(4, 'D', '4')]);
    expect(podium.map((p) => p.position)).toEqual([1, 2, 3]);
  });
  it('handles undefined', () => { expect(getPodium(undefined)).toEqual([]); });
});
