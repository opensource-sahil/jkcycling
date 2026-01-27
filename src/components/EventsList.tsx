'use client';

import { useState } from 'react';
import { Event } from '@/types/event';
import EventCard from './EventCard';

interface EventsListProps {
  initialEvents: Event[];
}

export default function EventsList({ initialEvents }: EventsListProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Default to showing 3, or all if expanded
  const visibleEvents = showAll ? initialEvents : initialEvents.slice(0, 3);
  const hasMore = initialEvents.length > 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {visibleEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <button 
            onClick={() => setShowAll(!showAll)}
            className="btn btn-outline"
          >
            {showAll ? 'Show Less' : `Show All Upcoming (${initialEvents.length})`}
          </button>
        </div>
      )}
    </div>
  );
}