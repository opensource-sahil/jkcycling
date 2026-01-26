import { eventService } from '@/services/eventService';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
      <div className="card" style={{ overflow: 'hidden', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '100%', height: '400px' }}>
          <Image src={event.image} alt={event.title} fill unoptimized style={{ objectFit: 'cover' }} />
        </div>
        <div className="card-body">
          <p className="text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            {event.type} • {event.district} •{' '}
            {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
          </p>
          <h1>{event.title}</h1>
          <p style={{ margin: '16px 0', lineHeight: 1.7 }}>{event.description}</p>

          <div className="flex flex-col md:flex-row" style={{ gap: '32px', marginTop: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
            
            {/* Left Column: Details */}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4">Event Details</h3>
              
              <div className="mb-4">
                <strong>Categories:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.categories?.map(cat => (
                    <span key={cat} style={{ background: 'var(--color-bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mb-2">
                <strong>Location:</strong> {event.location}
              </p>
              
              {event.organizer?.contact && (
                 <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                   <strong>Organizer Contact:</strong>
                   <p>{event.organizer.name}</p>
                   {event.organizer.contact.name && <p className="text-sm text-gray-600">{event.organizer.contact.name} ({event.organizer.contact.role})</p>}
                   {event.organizer.contact.phone && <p className="text-sm text-gray-600">📞 {event.organizer.contact.phone}</p>}
                 </div>
              )}
            </div>

            {/* Right Column: Actions */}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4">Registration</h3>
              
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
