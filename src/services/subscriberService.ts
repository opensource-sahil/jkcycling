import { db, TABLE_SUBSCRIBERS } from "@/lib/dynamodb";
import { Subscriber } from "@/types/event";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const subscriberService = {
  /**
   * Add or update a subscriber.
   */
  async addSubscriber(subscriber: Subscriber): Promise<void> {
    const command = new PutCommand({
      TableName: TABLE_SUBSCRIBERS,
      Item: subscriber,
    });

    await db.send(command);
  },

  /**
   * Get subscriber by email.
   */
  async getSubscriber(email: string): Promise<Subscriber | null> {
    const command = new GetCommand({
      TableName: TABLE_SUBSCRIBERS,
      Key: { email },
    });

    const response = await db.send(command);
    return (response.Item as Subscriber) || null;
  },

  /**
   * Get subscriber by token (for confirmation).
   * Note: This uses a Scan. For high traffic, add a GSI on the 'token' attribute.
   */
  async getSubscriberByToken(token: string): Promise<Subscriber | null> {
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
    return items.length > 0 ? items[0] : null;
  }
};
