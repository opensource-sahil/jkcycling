import { eventService } from '@/services/eventService';
import { ResultCard } from '@/components/ResultCard';
import styles from './Results.module.css';

export const revalidate = 3600;

export default async function ResultsPage() {
  const pastEvents = await eventService.getPastEvents();

  // The root layout already provides <main> and the page container.
  return (
    <>
      <h1 className={styles.pageTitle}>Past Events &amp; Results</h1>

      {pastEvents.length > 0 ? (
        <div className={styles.list}>
          {pastEvents.map((event) => (
            <ResultCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No past events to display yet.</p>
      )}
    </>
  );
}
