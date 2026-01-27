import { NextResponse } from 'next/server';
import { eventService } from '@/services/eventService';
import { subscriberService } from '@/services/subscriberService';
import eventsData from '@/data/events/events.json';
import pastEventsData from '@/data/events/past-events.json';
import subscribersData from '@/data/subscribers.json';
import { Event, Subscriber } from '@/types/event';

export async function GET() {
  try {
    let eventCount = 0;
    let subscriberCount = 0;

    // Migrate Upcoming Events
    for (const e of eventsData.events) {
      const now = new Date().toISOString();
      const event: Event = {
        id: e.id,
        title: e.title,
        date: e.date,
        district: e.district,
        type: e.type as "MTB" | "Road",
        description: e.description,
        location: e.location,
        image: e.image,
        notice: e.notice,
        categories: ["Men Elite", "Women Elite", "Masters", "U-18"],
        registration: {
          url: e.registrationUrl,
          isOpen: true,
          deadline: new Date(new Date(e.date).getTime() - 86400000 * 2).toISOString(), // 2 days before event
          fee: "500 INR"
        },
        organizer: {
          name: "JK Cycling Association",
          contact: {
            name: "District Secretary",
            phone: "+91-9999999999",
            role: "Event Coordinator"
          }
        },
        status: 'UPCOMING',
        audit: {
          createdAt: now,
          updatedAt: now,
          createdBy: "system-migration"
        }
      };
      await eventService.saveEvent(event);
      eventCount++;
    }

    // Migrate Past Events
    for (const e of pastEventsData.events) {
      const now = new Date().toISOString();
      // Mock results with categories
      const updatedResults = e.results.map(r => ({
        ...r,
        category: "Men Elite" // Default category for migration
      }));
      
      // Add a few dummy results for other categories to test grouping
      updatedResults.push({ position: 1, name: "Sarah Connor", time: "2:30:00", category: "Women Elite" });
      updatedResults.push({ position: 2, name: "Ripley", time: "2:35:00", category: "Women Elite" });

      const event: Event = {
        id: e.id,
        title: e.title,
        date: e.date,
        district: e.district,
        type: e.type as "MTB" | "Road",
        description: e.description,
        location: e.location,
        image: e.image,
        notice: e.notice,
        categories: ["Men Elite", "Women Elite"],
        registration: {
          isOpen: false,
          deadline: e.date,
        },
        organizer: {
          name: "JK Cycling Association"
        },
        status: 'COMPLETED',
        audit: {
          createdAt: now,
          updatedAt: now,
          createdBy: "system-migration"
        },
        results: updatedResults
      };
      await eventService.saveEvent(event);
      eventCount++;
    }

    // Migrate Subscribers
    if (subscribersData && subscribersData.subscribers) {
      for (const s of subscribersData.subscribers) {
        const subscriber: Subscriber = {
          id: s.id,
          email: s.email,
          name: s.name || undefined,
          district: s.district || 'Unknown',
          status: s.status as Subscriber['status'],
          createdAt: s.created_at || new Date().toISOString(),
          confirmedAt: s.confirmed_at || undefined,
        };
        await subscriberService.addSubscriber(subscriber);
        subscriberCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Migrated ${eventCount} events and ${subscriberCount} subscribers to DynamoDB with new schema.` 
    });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json({ success: false, error: 'Migration failed. Check console.' }, { status: 500 });
  }
}