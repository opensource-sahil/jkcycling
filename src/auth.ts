import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DynamoDBAdapter } from "@auth/dynamodb-adapter"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import { client, TABLE_AUTH, TABLE_AUTH_INDEX } from "@/lib/dynamodb"

const docClient = DynamoDBDocument.from(client, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
})

// DEBUG: Print configuration to Vercel Logs
const config = {
  tableName: TABLE_AUTH || "dev-jk-cycling-auth",
  indexName: TABLE_AUTH_INDEX || "dev-jk-cycling-auth-gsi",
};
console.log("--> AUTH DYNAMO CONFIG:", JSON.stringify(config, null, 2));

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DynamoDBAdapter(docClient, {
    tableName: config.tableName,
    indexName: config.indexName,
    partitionKey: "pk",
    sortKey: "sk",
    indexPartitionKey: "gsi1pk",
    indexSortKey: "gsi1sk",
  }),
  providers: [Google],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    }
  }
})
