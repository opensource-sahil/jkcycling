import eventsData from '@/data/events/events.json';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Event, EventsData } from '@/types/event';

export async function generateStaticParams() {
  const data = eventsData as EventsData;
  return data.events.map((e) => ({ id: e.id }));
}

export default async function EventPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params;
  const data = eventsData as EventsData;
  const event = data.events.find((e) => e.id === id) as Event | undefined;

  if (!event) return notFound();

  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto rounded-lg shadow p-6" style={{ background: 'var(--surface)' }}>
        <div className="relative h-64 w-full mb-6">
          <Image src={event.image} alt={event.title} fill unoptimized className="object-cover rounded" />
        </div>

        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
          {event.type} • {event.district} • {new Date(event.date).toLocaleDateString()}
        </p>

        <p className="mb-4" style={{ color: 'var(--text)' }}>{event.description}</p>

        <div className="space-y-2 mb-4">
          <p>
            <strong>Location:</strong> {event.location}
          </p>
          {event.registrationUrl && (
            <p>
              <a href={event.registrationUrl} className="hover:underline" style={{ color: 'var(--brand)' }}>
                Register / More details
              </a>
            </p>
          )}
          {event.notice && (
            <p>
              <a href={event.notice} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--success)' }}>
                Download Notice
              </a>
            </p>
          )}
        </div>

        <div className="mt-6">
          <Link href="/" className="hover:underline" style={{ color: 'var(--brand)' }}>
            ← Back to events
          </Link>
        </div>
      </div>
    </main>
  );
}
