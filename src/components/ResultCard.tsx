'use client';

import Image from 'next/image';
import { Event } from '@/types/event';
import { getPodium } from '@/lib/results';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  event: Event;
}

const PLACE_LABEL: Record<number, string> = { 1: '1ST', 2: '2ND', 3: '3RD' };
const PODIUM_ORDER = [2, 1, 3];

export function ResultCard({ event }: ResultCardProps) {
  const podium = getPodium(event.results);
  const byPosition = new Map(podium.map((r) => [r.position, r]));

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={event.image}
          alt={event.title}
          fill
          unoptimized
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{event.title}</h3>
        <p className="muted">
          {event.district} · {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
        </p>

        {podium.length > 0 ? (
          <div className={`podium ${styles.podium}`}>
            {PODIUM_ORDER.filter((position) => byPosition.has(position)).map((position) => {
              const result = byPosition.get(position)!;
              return (
                <div key={position} className={`pod pod--${position}`}>
                  <div className="pl">{PLACE_LABEL[position]}</div>
                  <div className="who">{result.name}</div>
                  <div className="t">{result.time}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.pending}>Results pending</p>
        )}

        {event.notice && (
          <div className={styles.actions}>
            <a
              href={event.notice}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--secondary"
            >
              Download full results (PDF)
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
