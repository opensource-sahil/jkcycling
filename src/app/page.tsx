import Link from 'next/link';
import { eventService } from '@/services/eventService';
import { getLatestResult, getPodium } from '@/lib/results';
import EventsList from '@/components/EventsList';
import SubscribeForm from '@/components/SubscribeForm';
import Hero from '@/components/Hero';
import styles from './Home.module.css';

export const revalidate = 3600; // revalidate at most every hour

const PODIUM_ORDER = [2, 1, 3];

export default async function Home() {
  const [upcomingEvents, pastEvents] = await Promise.all([
    eventService.getUpcomingEvents(),
    eventService.getPastEvents(),
  ]);

  const latest = getLatestResult(pastEvents);
  const podium = latest ? getPodium(latest.results) : [];
  const showLatestResults = Boolean(latest) && podium.length > 0;

  const byPosition = new Map(podium.map((result) => [result.position, result]));
  const orderedPodium = PODIUM_ORDER.filter((position) => byPosition.has(position)).map(
    (position) => byPosition.get(position)!
  );

  return (
    <>
      <Hero />

      <section className="section" id="upcoming">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">What&apos;s next</p>
              <h2 className={styles.secTitle}>Upcoming races &amp; rides</h2>
            </div>
          </div>

          <EventsList initialEvents={upcomingEvents} />

          {upcomingEvents.length === 0 && (
            <div className={styles.empty}>
              <p className="muted">No upcoming events scheduled. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {showLatestResults && latest && (
        <section className="section" style={{ background: 'var(--surface-sunken)' }}>
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Latest results</p>
                <h2 className={styles.secTitle}>Off the podium</h2>
              </div>
              <Link className="link" href="/results">
                All results →
              </Link>
            </div>
            <div className="card">
              <div className="section-head" style={{ marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>{latest.title}</h3>
                <span className="muted" style={{ fontSize: 13 }}>
                  {new Date(latest.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="podium">
                {orderedPodium.map((result) => {
                  const placeLabel = result.position === 1 ? '1ST' : result.position === 2 ? '2ND' : '3RD';
                  return (
                    <div key={result.position} className={`pod pod--${result.position}`}>
                      <div className="pl">{placeLabel}</div>
                      <div className="who">{result.name}</div>
                      <div className="t">{result.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className={styles.subscribeBand}>
            <div>
              <h2 className={styles.secTitle} style={{ margin: '0 0 var(--space-1)' }}>
                Never miss a start line.
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                Get an email the moment a new race opens for registration.
              </p>
            </div>
            <div className={styles.subscribeBandForm}>
              <SubscribeForm variant="inline" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
