'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Event, EventType } from '@/types/event';
import { getEventMedia, getEventStatusBadge } from '@/lib/event-card';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
}

const gradientClass: Record<'green' | 'sky' | 'flat', string> = {
  green: styles.mGreen,
  sky: styles.mSky,
  flat: styles.mFlat,
};

const badgeToneClass: Record<'success' | 'warning' | 'neutral' | 'danger' | 'brand', string> = {
  success: 'badge badge--success',
  warning: 'badge badge--warning',
  neutral: 'badge badge--neutral',
  danger: 'badge badge--danger',
  brand: 'badge badge--brand',
};

/** Road events get a mountain glyph; every other discipline gets a generic bike glyph. */
function EventTypeIcon({ type }: { type: EventType }) {
  if (type === 'Road') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 17.5V14l-3-3 4-3 2 3h2" />
    </svg>
  );
}

export default function EventCard({ event }: EventCardProps) {
  const media = getEventMedia(event);
  const badge = getEventStatusBadge(event);
  const detailHref = `/events/${event.id}`;

  const eventDate = new Date(event.date);
  const eyebrow = `${event.district} · ${eventDate.toLocaleDateString('en-US', { month: 'short' })}`;
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const deadlinePassed =
    !!event.registration.deadline && new Date(event.registration.deadline) < new Date();
  const canRegister = event.registration.isOpen && !!event.registration.url && !deadlinePassed;

  const primaryAction = canRegister
    ? {
        label: 'Register to ride',
        href: event.registration.url!,
        external: true,
        className: 'btn btn--accent btn--block',
      }
    : {
        label: 'View details',
        href: detailHref,
        external: false,
        className: 'btn btn--primary btn--block',
      };

  return (
    <article className={styles.card}>
      {media.kind === 'image' ? (
        <div className={styles.media}>
          <Image src={media.src} alt={event.title} fill unoptimized style={{ objectFit: 'cover' }} />
        </div>
      ) : (
        <div className={`${styles.media} ${gradientClass[media.variant]}`}>
          <EventTypeIcon type={media.icon} />
        </div>
      )}
      <div className={styles.body}>
        <p className="eyebrow">{eyebrow}</p>
        <h3 className={styles.name}>{event.title}</h3>
        <p className={styles.date}>{formattedDate}</p>
        <p className={styles.stats}>{event.type} · {event.district}</p>
        {badge && <span className={badgeToneClass[badge.tone]}>{badge.label}</span>}
        <div className={styles.act}>
          {primaryAction.external ? (
            <a href={primaryAction.href} target="_blank" rel="noopener noreferrer" className={primaryAction.className}>
              {primaryAction.label}
            </a>
          ) : (
            <Link href={primaryAction.href} className={primaryAction.className}>
              {primaryAction.label}
            </Link>
          )}
          {event.notice && (
            <a href={event.notice} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--block">
              Notice
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
