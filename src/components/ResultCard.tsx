'use client';

import Image from 'next/image';
import { Event } from '@/types/event';
import { Button } from './ui/Button';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  event: Event;
}

export function ResultCard({ event }: ResultCardProps) {
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
        <p className={styles.meta}>
          {event.district} • {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
        </p>
        
        <h4 className={styles.resultsTitle}>Top Results</h4>
        <div className={styles.resultsList}>
          {event.results?.slice(0, 3).map((result, index) => (
            <div key={index} className={styles.resultItem}>
              <span className={styles.position}>#{result.position} {result.name}</span>
              <span className={styles.time}>{result.time}</span>
            </div>
          ))}
          {(!event.results || event.results.length === 0) && (
            <p className="text-sm text-gray-500 italic">Results pending...</p>
          )}
        </div>
        
        {event.notice && (
          <div className={styles.actions}>
            <a href={event.notice} target="_blank" rel="noopener noreferrer">
              <Button style={{ backgroundColor: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }}>Download Full Results (PDF)</Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
