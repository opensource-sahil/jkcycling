'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
  <div style={{ background: 'var(--surface)' }} className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
        <div className="inline-block px-2 py-1 mb-2 text-sm font-semibold text-white bg-blue-600 rounded">
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
        <div className="flex justify-between items-center">
          <Link
            href={`/events/${event.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
          </Link>
          {event.notice && (
            <a
              href={event.notice}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Download Notice
            </a>
          )}
        </div>
      </div>
    </div>
  );
}