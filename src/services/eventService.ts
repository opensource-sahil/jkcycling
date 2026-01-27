import { db, TABLE_EVENTS } from "@/lib/dynamodb";
import { Event } from "@/types/event";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { unstable_cache } from "next/cache";

// Raw database operations (Internal)
const fetchUpcomingEvents = async (): Promise<Event[]> => {
  console.log("Fetching upcoming events from DynamoDB...");
  const command = new ScanCommand({
    TableName: TABLE_EVENTS,
    FilterExpression: "#s = :status",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":status": "UPCOMING" },
  });

  const response = await db.send(command);
  const items = (response.Items as Event[] || []).sort((a, b) => a.date.localeCompare(b.date));
  console.log(`Fetched ${items.length} upcoming events.`);
  return items;
};

const fetchPastEvents = async (): Promise<Event[]> => {
  console.log("Fetching past events from DynamoDB...");
  const command = new ScanCommand({
    TableName: TABLE_EVENTS,
    FilterExpression: "#s = :status",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":status": "COMPLETED" },
  });

  const response = await db.send(command);
  const items = (response.Items as Event[] || []).sort((a, b) => b.date.localeCompare(a.date));
  console.log(`Fetched ${items.length} past events.`);
  return items;
};

const fetchEventById = async (id: string): Promise<Event | null> => {
  console.log(`Fetching event by ID: ${id}`);
  const command = new GetCommand({
    TableName: TABLE_EVENTS,
    Key: { id },
  });

  const response = await db.send(command);
  const item = (response.Item as Event) || null;
  console.log(`Event fetched: ${item ? 'Found' : 'Not Found'}`);
  return item;
};

// Cached Service
export const eventService = {
  /**
   * Get all upcoming events (Cached 1 Hour)
   */
  getUpcomingEvents: unstable_cache(
    fetchUpcomingEvents,
    ['upcoming-events'], 
    { tags: ['events'], revalidate: 3600 }
  ),

  /**
   * Get all past/completed events (Cached 1 Hour)
   */
  getPastEvents: unstable_cache(
    fetchPastEvents,
    ['past-events'],
    { tags: ['events'], revalidate: 3600 }
  ),

  /**
   * Get a single event by ID (Cached 1 Hour)
   */
  getEventById: (id: string) => unstable_cache(
    async () => fetchEventById(id),
    [`event-${id}`],
    { tags: ['events'], revalidate: 3600 }
  )(),

  /**
   * Create or Update an event (Direct DB Write - No Cache)
   * Note: In a real admin dashboard, calling this should also revalidate tags.
   */
  async saveEvent(event: Event): Promise<void> {
    console.log(`Saving event: ${event.id}`);
    const command = new PutCommand({
      TableName: TABLE_EVENTS,
      Item: {
        ...event,
        updatedAt: new Date().toISOString(),
      },
    });

    await db.send(command);
    console.log(`Event saved successfully: ${event.id}`);
  },

  /**
   * Delete an event by ID.
   */
  async deleteEvent(id: string): Promise<void> {
    console.log(`Deleting event: ${id}`);
    const { DeleteCommand } = await import("@aws-sdk/lib-dynamodb");
    const command = new DeleteCommand({
      TableName: TABLE_EVENTS,
      Key: { id },
    });
    await db.send(command);
    console.log(`Event deleted: ${id}`);
  }
};