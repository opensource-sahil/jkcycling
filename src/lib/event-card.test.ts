import { describe, it, expect } from 'vitest';
import { getEventMedia, getEventStatusBadge } from './event-card';
import type { Event } from '@/types/event';

const base: Event = {
  id: '1', title: 'T', date: '2026-07-18', district: 'Srinagar', type: 'Road',
  description: '', location: '', image: '', categories: [],
  registration: { isOpen: true }, status: 'UPCOMING',
  audit: { createdAt: '', updatedAt: '' },
};

describe('getEventMedia', () => {
  it('uses the image when one is set', () => {
    expect(getEventMedia({ ...base, image: '/x.jpg' })).toEqual({ kind: 'image', src: '/x.jpg' });
  });
  it('falls back to a gradient block keyed to the event type when no image', () => {
    const m = getEventMedia({ ...base, image: '' });
    expect(m.kind).toBe('gradient');
    if (m.kind === 'gradient') expect(m.icon).toBe('Road');
  });
});

describe('getEventStatusBadge', () => {
  it('shows Registration open when registration is open and event is upcoming', () => {
    expect(getEventStatusBadge({ ...base, status: 'UPCOMING', registration: { isOpen: true } }))
      .toEqual({ label: 'Registration open', tone: 'success' });
  });
  it('shows Cancelled with danger tone', () => {
    expect(getEventStatusBadge({ ...base, status: 'CANCELLED' }))
      .toEqual({ label: 'Cancelled', tone: 'danger' });
  });
  it('returns null for a completed event', () => {
    expect(getEventStatusBadge({ ...base, status: 'COMPLETED' })).toBeNull();
  });
});
