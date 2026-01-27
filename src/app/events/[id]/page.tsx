import { eventService } from '@/services/eventService';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './EventDetail.module.css';

export async function generateStaticParams() {
  const events = await eventService.getUpcomingEvents();
  return events.map((e) => ({ id: e.id }));
}

export default async function EventPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await eventService.getEventById(id);

  if (!event) return notFound();

  const isRegistrationOpen = event.registration?.isOpen && 
    (!event.registration.deadline || new Date(event.registration.deadline) > new Date());

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
          <p className={styles.description}>{event.description}</p>

          <div className={styles.columns}>
            
            {/* Left Column: Details */}
            <div className={styles.column}>
              <h3 className={styles.sectionTitle}>Event Details</h3>
              
              <div className="mb-4">
                <strong>Categories:</strong>
                <div className={styles.tagContainer}>
                  {event.categories?.map(cat => (
                    <span key={cat} className={styles.tag}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mb-2">
                <strong>Location:</strong> {event.location}
              </p>
              
              {event.organizer?.contact && (
                 <div className={styles.organizerBox}>
                   <strong>Organizer Contact:</strong>
                   <p>{event.organizer.name}</p>
                   {event.organizer.contact.name && <p className="text-sm text-gray-600">{event.organizer.contact.name} ({event.organizer.contact.role})</p>}
                   {event.organizer.contact.phone && <p className="text-sm text-gray-600">📞 {event.organizer.contact.phone}</p>}
                 </div>
              )}
            </div>

            {/* Right Column: Actions */}
            <div className={styles.column}>
              <h3 className={styles.sectionTitle}>Registration</h3>
              
              {event.registration?.deadline && (
                <p className="mb-4 text-sm">
                  <strong>Deadline:</strong> {new Date(event.registration.deadline).toLocaleDateString()}
                </p>
              )}

              <div className="flex flex-col gap-3">
                {isRegistrationOpen && event.registration?.url ? (
                  <a href={event.registration.url} className="btn w-full text-center" target="_blank" rel="noopener noreferrer">
                    Register Now {event.registration.fee ? `(${event.registration.fee})` : ''}
                  </a>
                ) : (
                  <button disabled className="btn w-full text-center opacity-50 cursor-not-allowed">
                    Registration Closed
                  </button>
                )}

                {event.notice && (
                  <a href={event.notice} className="btn w-full text-center" style={{ backgroundColor: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }} target="_blank" rel="noopener noreferrer">
                    Download Notice (PDF)
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Link href="/" className="btn" style={{ backgroundColor: 'transparent', color: 'var(--color-text)' }}>← Back to all events</Link>
      </div>
    </>
  );
}
