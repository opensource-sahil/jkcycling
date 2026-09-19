'use client';

import { useMemo, useState } from 'react';
import { Event, EventType } from '@/types/event';
import { ResultCard } from '@/components/ResultCard';
import styles from './Results.module.css';

// Fixed display order for the filter chips — not derived from the data,
// so the chip row doesn't reshuffle as new event types are added.
const EVENT_TYPE_ORDER: EventType[] = ['MTB', 'Road', 'Cyclocross', 'Downhill', 'BMX', 'Enduro'];

interface ResultsGridProps {
  events: Event[];
}

export function ResultsGrid({ events }: ResultsGridProps) {
  const [activeType, setActiveType] = useState<EventType | 'ALL'>('ALL');

  // Only offer chips for types that actually occur in the fetched past
  // events — never invent categories with no results behind them.
  const types = useMemo(
    () => EVENT_TYPE_ORDER.filter((type) => events.some((event) => event.type === type)),
    [events]
  );

  const filteredEvents = activeType === 'ALL' ? events : events.filter((event) => event.type === activeType);

  return (
    <>
      {types.length > 1 && (
        <div className={`chips ${styles.filters}`}>
          <button
            type="button"
            className={`chip ${activeType === 'ALL' ? 'chip--active' : ''}`}
            onClick={() => setActiveType('ALL')}
          >
            All
          </button>
          {types.map((type) => (
            <button
              key={type}
              type="button"
              className={`chip ${activeType === type ? 'chip--active' : ''}`}
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {filteredEvents.length > 0 ? (
        <div className={styles.list}>
          {filteredEvents.map((event) => (
            <ResultCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No results match this filter.</p>
      )}
    </>
  );
}
