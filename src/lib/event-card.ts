import type { Event, EventType } from '@/types/event';

export function getEventMedia(event: Event) {
  if (event.image) return { kind: 'image' as const, src: event.image };
  const variant = event.type === 'Road' ? 'green' as const
    : event.type === 'MTB' || event.type === 'Downhill' || event.type === 'Enduro' ? 'sky' as const
    : 'flat' as const;
  return { kind: 'gradient' as const, variant, icon: event.type as EventType };
}

export function getEventStatusBadge(event: Event) {
  if (event.status === 'CANCELLED') return { label: 'Cancelled', tone: 'danger' as const };
  if (event.status === 'COMPLETED') return null;
  if (event.status === 'UPCOMING') {
    return event.registration.isOpen
      ? { label: 'Registration open', tone: 'success' as const }
      : { label: 'Coming soon', tone: 'neutral' as const };
  }
  return null;
}
