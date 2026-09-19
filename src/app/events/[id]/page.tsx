import { eventService } from '@/services/eventService';
import { getEventStatusBadge } from '@/lib/event-card';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './EventDetail.module.css';

export async function generateStaticParams() {
  const events = await eventService.getUpcomingEvents();
  return events.map((e) => ({ id: e.id }));
}

const badgeToneClass: Record<'success' | 'warning' | 'neutral' | 'danger' | 'brand', string> = {
  success: 'badge badge--success',
  warning: 'badge badge--warning',
  neutral: 'badge badge--neutral',
  danger: 'badge badge--danger',
  brand: 'badge badge--brand',
};

export default async function EventPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await eventService.getEventById(id);

  if (!event) return notFound();

  const badge = getEventStatusBadge(event);
  const hasOrganizer = Boolean(event.organizer?.name || event.organizer?.contact);
  const contact = event.organizer?.contact;

  // Label for the disabled Register button — derived from the actual reason
  // registration isn't clickable, independent of the status badge above it.
  // (registration.isOpen can be true with no url yet, which must never read
  // as if the working "Register to ride" link were present.)
  const registrationDisabledLabel =
    event.status === 'CANCELLED'
      ? 'Registration closed'
      : event.status === 'COMPLETED'
      ? 'Event finished'
      : event.registration.isOpen && !event.registration.url
      ? 'Registration link coming soon'
      : 'Registration closed';

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' });
  const formattedDeadline = event.registration.deadline
    ? new Date(event.registration.deadline).toLocaleDateString('en-US', { dateStyle: 'long' })
    : null;

  return (
    <>
      <Link href="/" className="link">← All events</Link>

      <div className={styles.layout}>
        <div>
          <div className={styles.poster}>
            <Image src={event.image} alt={event.title} fill unoptimized style={{ objectFit: 'cover' }} />
          </div>

          <p className={`eyebrow ${styles.eyebrow}`}>
            {event.type} · {event.district} · {formattedDate}
          </p>
          <h1 className={styles.title}>{event.title}</h1>
          {badge && <span className={badgeToneClass[badge.tone]}>{badge.label}</span>}

          <p className={styles.description}>{event.description}</p>

          {event.categories.length > 0 && (
            <div className={styles.block}>
              <h2 className={styles.subHeading}>Categories</h2>
              <div className="chips">
                {event.categories.map((category) => (
                  <span key={category} className="chip">{category}</span>
                ))}
              </div>
            </div>
          )}

          {hasOrganizer && (
            <div className={styles.block}>
              <h2 className={styles.subHeading}>Organizer</h2>
              <div className="card">
                {event.organizer?.name && <p className={styles.organizerName}>{event.organizer.name}</p>}
                {contact && (
                  <ul className={styles.contactList}>
                    {contact.name && (
                      <li>{contact.name}{contact.role ? ` · ${contact.role}` : ''}</li>
                    )}
                    {contact.phone && <li>{contact.phone}</li>}
                    {contact.email && <li>{contact.email}</li>}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className={styles.side}>
          <div className="card">
            {event.registration.fee && (
              <div className={styles.price}>
                <span className={styles.priceValue}>{event.registration.fee}</span>
                <span className="muted">entry</span>
              </div>
            )}

            <div className={styles.facts}>
              <div className={styles.factRow}>
                <span className="muted">Date</span>
                <span className={styles.factValue}>{formattedDate}</span>
              </div>
              <div className={styles.factRow}>
                <span className="muted">Location</span>
                <span className={styles.factValue}>{event.location}</span>
              </div>
              {formattedDeadline && (
                <div className={styles.factRow}>
                  <span className="muted">Registration closes</span>
                  <span className={styles.factValue}>{formattedDeadline}</span>
                </div>
              )}
            </div>

            {event.registration.instructions && (
              <p className={styles.instructions}>{event.registration.instructions}</p>
            )}

            {event.registration.isOpen && event.registration.url ? (
              <a
                href={event.registration.url}
                className="btn btn--accent btn--block btn--lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Register to ride
              </a>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled={true}
                className={`btn btn--secondary btn--block btn--lg ${styles.closedBtn}`}
              >
                {registrationDisabledLabel}
              </button>
            )}

            {event.notice && (
              <a
                href={event.notice}
                className={`btn btn--secondary btn--block ${styles.noticeLink}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download notice (PDF)
              </a>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
