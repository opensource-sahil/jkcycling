import { db, TABLE_SUBSCRIBERS } from "@/lib/dynamodb";
import { Subscriber } from "@/types/event";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

export const subscriberService = {
  /**
   * Add or update a subscriber.
   */
  async addSubscriber(subscriber: Subscriber): Promise<void> {
    console.log(`Adding subscriber: ${subscriber.email}`);
    const command = new PutCommand({
      TableName: TABLE_SUBSCRIBERS,
      Item: subscriber,
    });

    await db.send(command);
    console.log(`Subscriber added successfully: ${subscriber.email}`);
  },

  /**
   * Get subscriber by email.
   */
  async getSubscriber(email: string): Promise<Subscriber | null> {
    console.log(`Fetching subscriber by email: ${email}`);
    const command = new GetCommand({
      TableName: TABLE_SUBSCRIBERS,
      Key: { email },
    });

    const response = await db.send(command);
    const item = (response.Item as Subscriber) || null;
    console.log(`Subscriber fetch result: ${item ? 'Found' : 'Not Found'}`);
    return item;
  },

  /**
   * Get subscriber by token (for confirmation).
   * Note: This uses a Scan. For high traffic, add a GSI on the 'token' attribute.
   */
  async getSubscriberByToken(token: string): Promise<Subscriber | null> {
    console.log(`Fetching subscriber by token...`);
    const command = new ScanCommand({
      TableName: TABLE_SUBSCRIBERS,
      FilterExpression: "#t = :token",
      ExpressionAttributeNames: {
        "#t": "token",
      },
      ExpressionAttributeValues: {
        ":token": token,
      },
    });

    const response = await db.send(command);
    const items = response.Items as Subscriber[];
    console.log(`Subscriber token lookup: ${items.length > 0 ? 'Found' : 'Not Found'}`);
    return items.length > 0 ? items[0] : null;
  },

  /**
   * Get subscriber by their long-lived unsubscribe token.
   * Note: This uses a Scan. For high traffic, add a GSI on 'unsubscribeToken'.
   */
  async getSubscriberByUnsubscribeToken(token: string): Promise<Subscriber | null> {
    const command = new ScanCommand({
      TableName: TABLE_SUBSCRIBERS,
      FilterExpression: "#t = :token",
      ExpressionAttributeNames: { "#t": "unsubscribeToken" },
      ExpressionAttributeValues: { ":token": token },
    });

    const response = await db.send(command);
    const items = (response.Items as Subscriber[]) || [];
    return items.length > 0 ? items[0] : null;
  },

  /**
   * Every confirmed subscriber. Paginated, because a Scan caps at 1MB and
   * silently truncating a recipient list is worse than a slow query.
   */
  async listConfirmed(): Promise<Subscriber[]> {
    const subscribers: Subscriber[] = [];
    let startKey: Record<string, unknown> | undefined;

    do {
      const response = await db.send(new ScanCommand({
        TableName: TABLE_SUBSCRIBERS,
        FilterExpression: "#s = :status",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":status": "confirmed" },
        ExclusiveStartKey: startKey,
      }));

      subscribers.push(...((response.Items as Subscriber[]) || []));
      startKey = response.LastEvaluatedKey;
    } while (startKey);

    console.log(`Found ${subscribers.length} confirmed subscribers.`);
    return subscribers;
  },

  /**
   * Return the subscriber's unsubscribe token, creating and persisting one if
   * they predate the field. Subscribers confirmed before unsubscribe links
   * existed have no token, and every bulk email needs one.
   */
  async ensureUnsubscribeToken(subscriber: Subscriber): Promise<string> {
    if (subscriber.unsubscribeToken) return subscriber.unsubscribeToken;

    const unsubscribeToken = randomUUID();
    await this.addSubscriber({ ...subscriber, unsubscribeToken });
    console.log(`Backfilled unsubscribe token for ${subscriber.email}`);
    return unsubscribeToken;
  },

  /**
   * Mark a subscriber as unsubscribed. Their record is kept so a re-subscribe
   * does not resurrect a stale confirmation state.
   */
  async unsubscribe(subscriber: Subscriber): Promise<void> {
    await this.addSubscriber({ ...subscriber, status: 'unsubscribed' });
    console.log(`Unsubscribed: ${subscriber.email}`);
  },
};
