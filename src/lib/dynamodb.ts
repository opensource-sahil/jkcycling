import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const db = DynamoDBDocumentClient.from(client);

// Table names from environment variables or defaults
export const TABLE_EVENTS = process.env.DYNAMODB_TABLE_EVENTS;
export const TABLE_SUBSCRIBERS = process.env.DYNAMODB_TABLE_SUBSCRIBERS;
export const TABLE_AUTH = process.env.DYNAMODB_TABLE_AUTH;
export const TABLE_AUTH_INDEX = process.env.DYNAMODB_TABLE_AUTH_INDEX;