import { eventService } from '@/services/eventService';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Result } from '@/types/event';
import styles from './ResultDetail.module.css';

export async function generateStaticParams() {
  const events = await eventService.getPastEvents();
  return events.map((e) => ({ id: e.id }));
}

// Helper to group results by category
function groupResultsByCategory(results: Result[]) {
  const groups: Record<string, Result[]> = {};
  results.forEach(r => {
    const cat = r.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  });
  return groups;
}

const PLACE_STYLE: Record<number, string> = {
  1: styles.gold,
  2: styles.silver,
  3: styles.bronze,
};

export default async function ResultDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await eventService.getEventById(id);

  if (!event || event.status !== 'COMPLETED') return notFound();

  // A race can be published with only a results PDF and no structured
  // placings, so an empty podium is valid here. The sitemap lists every
  // completed event, and 404ing on those was costing us indexed pages.
  const results = event.results ?? [];
  const groupedResults = groupResultsByCategory(results);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <Image src={event.image} alt={event.title} fill unoptimized style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.cardBody}>
          <p className={styles.meta}>
            {event.type} • {event.district} •{' '}
            {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
          </p>
          <h1 className={styles.title}>{event.title}</h1>

          <div className={styles.resultsSection}>
            <h2 className={styles.sectionTitle}>Top Results</h2>

            {results.length === 0 && (
              <p className={styles.empty}>
                {event.notice
                  ? 'Placings for this race are published in the results PDF below.'
                  : 'Results for this race have not been published yet.'}
              </p>
            )}

            {Object.entries(groupedResults).map(([category, categoryResults]) => (
              <div key={category} className={styles.categoryGroup}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                <div className={styles.rows}>
                  {categoryResults
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((r, i) => (
                      <div key={i} className={styles.row}>
                        <div className={styles.rider}>
                          <span className={`${styles.position} ${PLACE_STYLE[r.position] ?? ''}`}>
                            {r.position}
                          </span>
                          <div className={styles.name}>
                            {r.name}
                            {r.team && <span className={styles.team}>{r.team}</span>}
                          </div>
                        </div>
                        <div className={styles.time}>{r.time}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {event.notice && (
            <div className={styles.pdfAction}>
              <a href={event.notice} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Download Full Results PDF
              </a>
            </div>
          )}
        </div>
      </div>

      <Link href="/results" className="btn btn-outline">
        ← Back to all results
      </Link>
    </>
  );
}
