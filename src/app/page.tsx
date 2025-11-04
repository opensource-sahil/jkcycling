import { EventsData } from '@/types/event';
import EventCard from '@/components/EventCard';
import eventsData from '@/data/events/events.json';
import SubscribeForm from '@/components/SubscribeForm';

export default function Home() {
  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12" style={{ color: 'var(--text)' }}>
          Cycling Events in Jammu & Kashmir
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(eventsData as EventsData).events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-center mb-4" style={{ color: 'var(--text)' }}>Subscribe for event updates</h2>
          <SubscribeForm />
        </section>

        {(eventsData as EventsData).events.length === 0 && (
          <p className="text-center text-lg" style={{ color: 'var(--muted)' }}>
            No upcoming events at the moment. Check back soon!
          </p>
        )}
      </div>
    </main>
  );
}
