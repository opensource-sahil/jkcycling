import { eventService } from '@/services/eventService';
import { ResultsGrid } from './ResultsGrid';
import styles from './Results.module.css';

export const revalidate = 3600;

export default async function ResultsPage() {
  const pastEvents = await eventService.getPastEvents();

  // The root layout already provides <main> and the page container.
  return (
    <>
      <p className="eyebrow">Published results</p>
      <h1 className={styles.pageTitle}>Past Events &amp; Results</h1>

      {pastEvents.length > 0 ? (
        <ResultsGrid events={pastEvents} />
      ) : (
        <p className={styles.empty}>No past events to display yet.</p>
      )}
    </>
  );
}
