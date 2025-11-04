'use client';

import { PastEvent } from '@/types/event';
import Image from 'next/image';

interface ResultCardProps {
  event: PastEvent;
}

export default function ResultCard({ event }: ResultCardProps) {
  return (
  <div style={{ background: 'var(--surface)' }} className="rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={event.image}
          alt={event.title}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="inline-block px-2 py-1 mb-2 text-sm font-semibold text-white bg-green-600 rounded">
          {event.type}
        </div>
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
  <p className="mb-2" style={{ color: 'var(--muted)' }}>{event.district}</p>
        <p className="text-gray-800 mb-4">
          {new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        
        <div className="mt-4">
          <h4 className="font-semibold text-lg mb-2">Results</h4>
          <div className="space-y-2">
            {event.results.map((result, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 px-3 rounded"
                style={{ background: 'var(--bg)' }}
              >
                <span className="font-medium" style={{ color: 'var(--text)' }}>
                  #{result.position} - {result.name}
                </span>
                <span style={{ color: 'var(--muted)' }}>{result.time}</span>
              </div>
            ))}
          </div>
        </div>

        {event.notice && (
          <div className="mt-4">
            <a
              href={event.notice}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Download Full Results
            </a>
          </div>
        )}
      </div>
    </div>
  );
}