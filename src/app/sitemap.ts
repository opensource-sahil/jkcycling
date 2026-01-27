import { MetadataRoute } from 'next'
import { eventService } from '@/services/eventService'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jkcycling.com'
  
  // Static pages
  const routes = [
    '',
    '/results',
    '/donate',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic Event Pages
  const upcoming = await eventService.getUpcomingEvents();
  const past = await eventService.getPastEvents();
  const allEvents = [...upcoming, ...past];

  const eventRoutes = allEvents.map((event) => ({
    url: `${baseUrl}/events/${event.id}`,
    lastModified: new Date(event.audit.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic Result Pages (currently same as events, but if they differ in future)
  const resultRoutes = past.map((event) => ({
    url: `${baseUrl}/results/${event.id}`,
    lastModified: new Date(event.audit.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...eventRoutes, ...resultRoutes]
}