import { eventService } from '@/services/eventService';
import EventsList from '@/components/EventsList';
import SubscribeForm from '@/components/SubscribeForm';
import Hero from '@/components/Hero';

export const revalidate = 3600; // revalidate at most every hour

export default async function Home() {
  const events = await eventService.getUpcomingEvents();

  return (
    <>
      <Hero />
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <section style={{ margin: '4rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h2 id="events" style={{ fontSize: '2rem' }}>Upcoming Events</h2>
          </div>
          
          <EventsList initialEvents={events} />
          
          {events.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>No upcoming events scheduled. Stay tuned!</p>
            </div>
          )}
        </section>

        <section style={{ marginTop: '4rem', maxWidth: '600px', margin: '4rem auto 0' }}>
          <SubscribeForm />
        </section>
      </div>
    </>
  );
}
