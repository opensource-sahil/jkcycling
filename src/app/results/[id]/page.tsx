import pastEventsData from '@/data/events/past-events.json';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PastEvent, PastEventsData } from '@/types/event';

export async function generateStaticParams() {
  const data = pastEventsData as PastEventsData;
  return data.events.map((e) => ({ id: e.id }));
}

export default async function ResultDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params;
  const data = pastEventsData as PastEventsData;
  const event = data.events.find((e) => e.id === id) as PastEvent | undefined;

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

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Results</h3>
          <div className="space-y-2">
            {event.results.map((r, i) => (
              <div key={i} className="flex justify-between items-center py-2 px-3 rounded" style={{ background: 'var(--bg)' }}>
                <div className="font-medium" style={{ color: 'var(--text)' }}>#{r.position} — {r.name}</div>
                <div style={{ color: 'var(--muted)' }}>{r.time}</div>
              </div>
            ))}
          </div>
        </div>

        {event.notice && (
          <p className="mb-4">
            <a href={event.notice} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--success)' }}>
              Download Full Results
            </a>
          </p>
        )}

        <div className="mt-6">
          <Link href="/results" className="hover:underline" style={{ color: 'var(--brand)' }}>
            ← Back to results
          </Link>
        </div>
      </div>
    </main>
  );
}
