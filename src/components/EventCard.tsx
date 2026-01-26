'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/types/event';
import styles from './EventCard.module.css';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
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
        <span className={styles.type}>{event.type}</span>
        <h3 className={styles.title}>{event.title}</h3>
        <div className={styles.meta}>
          <span>{event.district}</span>
          <span>•</span>
          <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <p className={styles.description}>{event.description}</p>
        <div className={styles.actions}>
          <Link href={`/events/${event.id}`} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            View Details
          </Link>
          {event.notice && (
            <a href={event.notice} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Notice
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
