import { eventService } from '@/services/eventService';
import { ResultCard } from '@/components/ResultCard';

export const revalidate = 3600;

export default async function ResultsPage() {
  const pastEvents = await eventService.getPastEvents();

  return (
    <main className="container py-8">
      <div>
        <h1 className="text-3xl font-bold mb-8">Past Events & Results</h1>
        <div className="grid gap-6">
          {pastEvents.map((event) => (
            <ResultCard key={event.id} event={event} />
          ))}
        </div>
        {pastEvents.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No past events to display yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
