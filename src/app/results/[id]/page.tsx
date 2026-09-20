import { eventService } from '@/services/eventService';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPodium } from '@/lib/results';
import styles from './ResultDetail.module.css';

export async function generateStaticParams() {
  const events = await eventService.getPastEvents();
  return events.map((e) => ({ id: e.id }));
}

const PLACE_LABEL: Record<number, string> = { 1: '1ST', 2: '2ND', 3: '3RD' };
const PODIUM_ORDER = [2, 1, 3];

export default async function ResultDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await eventService.getEventById(id);

  if (!event || event.status !== 'COMPLETED') return notFound();

  // A race can be published with only a results PDF and no structured
  // placings, so an empty podium is valid here. The sitemap lists every
  // completed event, and 404ing on those was costing us indexed pages.
  const results = event.results ?? [];
  const podium = getPodium(event.results);
  const byPosition = new Map(podium.map((r) => [r.position, r]));

  const sortedResults = [...results].sort((a, b) => {
    const byCategory = a.category.localeCompare(b.category);
    return byCategory !== 0 ? byCategory : a.position - b.position;
  });

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' });

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <Image src={event.image} alt={event.title} fill unoptimized style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.cardBody}>
          <p className="eyebrow">
            {formattedDate} · {event.type} · {event.district}
          </p>
          <h1 className={styles.title}>{event.title}</h1>

          {podium.length > 0 && (
            <div className={`podium ${styles.podium}`}>
              {PODIUM_ORDER.filter((position) => byPosition.has(position)).map((position) => {
                const result = byPosition.get(position)!;
                return (
                  <div key={position} className={`pod pod--${position}`}>
                    <div className="pl">{PLACE_LABEL[position]}</div>
                    <div className="who">{result.name}</div>
                    <div className="t">{result.time}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.resultsSection}>
            <h2 className={styles.sectionTitle}>Full results</h2>

            {results.length === 0 ? (
              <p className={styles.empty}>
                {event.notice
                  ? 'Placings for this race are published in the results PDF below.'
                  : 'Results for this race have not been published yet.'}
              </p>
            ) : (
              <div className={styles.tableWrap}>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Pos</th>
                      <th scope="col">Rider</th>
                      <th scope="col" className="num">Time</th>
                      <th scope="col">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((r, i) => (
                      <tr key={i} className={r.position === 1 ? 'win' : undefined}>
                        <td className="num">{r.position}</td>
                        <td>
                          {r.name}
                          {r.team && <span className={styles.team}>{r.team}</span>}
                        </td>
                        <td className="num">{r.time}</td>
                        <td>{r.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {event.notice && (
            <div className={styles.pdfAction}>
              <a href={event.notice} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                Download full results PDF
              </a>
            </div>
          )}
        </div>
      </div>

      <Link href="/results" className="btn btn--secondary">
        ← Back to all results
      </Link>
    </>
  );
}
