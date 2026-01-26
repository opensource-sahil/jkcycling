import { eventService } from '@/services/eventService';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Result } from '@/types/event';

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

export default async function ResultDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await eventService.getEventById(id);

  if (!event || event.status !== 'COMPLETED' || !event.results) return notFound();

  const groupedResults = groupResultsByCategory(event.results);

  return (
    <>
      <div className="card" style={{ overflow: 'hidden', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
          <Image src={event.image} alt={event.title} fill unoptimized style={{ objectFit: 'cover' }} />
        </div>
        <div className="card-body">
          <p className="text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
            {event.type} • {event.district} •{' '}
            {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
          </p>
          <h1>{event.title}</h1>
          
          <div style={{ marginTop: '32px' }}>
            <h2 className="text-2xl font-bold mb-6">Top Results</h2>
            
            {Object.entries(groupedResults).map(([category, results]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold mb-3 px-2 border-l-4 border-[var(--color-primary)] bg-gray-50 py-1">
                  {category}
                </h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {results.sort((a, b) => a.position - b.position).map((r, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                          ${r.position === 1 ? 'bg-yellow-100 text-yellow-700' : 
                            r.position === 2 ? 'bg-gray-200 text-gray-700' : 
                            r.position === 3 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-500'}
                        `}>
                          {r.position}
                        </div>
                        <div className="font-medium">
                          {r.name}
                          {r.team && <span className="text-sm text-gray-500 block">{r.team}</span>}
                        </div>
                      </div>
                      <div className="font-mono text-lg">{r.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {event.notice && (
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <a
                href={event.notice}
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-block"
              >
                Download Full Results PDF
              </a>
            </div>
          )}
        </div>
      </div>
      <div>
        <Link href="/results" className="btn" style={{ backgroundColor: 'transparent', color: 'var(--color-text)' }}>← Back to all results</Link>
      </div>
    </>
  );
}
