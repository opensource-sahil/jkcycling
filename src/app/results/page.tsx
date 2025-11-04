import { PastEventsData } from '@/types/event';
import ResultCard from '@/components/ResultCard';
import pastEventsData from '@/data/events/past-events.json';

export default function ResultsPage() {
  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--text)' }}>
          Past Events & Results
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(pastEventsData as PastEventsData).events.map((event) => (
            <ResultCard key={event.id} event={event} />
          ))}
        </div>

        {(pastEventsData as PastEventsData).events.length === 0 && (
          <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>
            No past events to display yet.
          </p>
        )}
      </div>
    </main>
  );
}