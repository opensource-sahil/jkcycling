import { db, TABLE_GROUPS } from "@/lib/dynamodb";
import { RideGroup } from "@/types/ride-group";
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { unstable_cache } from "next/cache";

/**
 * True when the groups table does not exist or is not configured.
 *
 * Ride groups are additive: the rest of the site must keep working before the
 * table is provisioned, and a preview deploy without the env var should render
 * an empty directory rather than a 500. Writes are deliberately not forgiving.
 */
function isMissingTable(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: string }).name === 'ResourceNotFoundException'
  );
}

async function scanGroups(onlyPublished: boolean): Promise<RideGroup[]> {
  if (!TABLE_GROUPS) {
    console.warn('DYNAMODB_TABLE_GROUPS is not set; treating the ride group directory as empty.');
    return [];
  }

  const groups: RideGroup[] = [];
  let startKey: Record<string, unknown> | undefined;

  try {
    do {
      const response = await db.send(new ScanCommand({
        TableName: TABLE_GROUPS,
        ...(onlyPublished
          ? {
              FilterExpression: "#s = :status",
              ExpressionAttributeNames: { "#s": "status" },
              ExpressionAttributeValues: { ":status": "PUBLISHED" },
            }
          : {}),
        ExclusiveStartKey: startKey,
      }));

      groups.push(...((response.Items as RideGroup[]) || []));
      startKey = response.LastEvaluatedKey;
    } while (startKey);
  } catch (error) {
    if (isMissingTable(error)) {
      console.warn(`Ride groups table "${TABLE_GROUPS}" does not exist yet; returning an empty directory.`);
      return [];
    }
    throw error;
  }

  return groups.sort((a, b) => a.district.localeCompare(b.district) || a.name.localeCompare(b.name));
}

const fetchPublished = () => scanGroups(true);

const fetchGroupById = async (id: string): Promise<RideGroup | null> => {
  if (!TABLE_GROUPS) return null;
  try {
    const response = await db.send(new GetCommand({ TableName: TABLE_GROUPS, Key: { id } }));
    return (response.Item as RideGroup) || null;
  } catch (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
};

export const rideGroupService = {
  /** Published groups, for the public directory (cached 1 hour). */
  listPublished: unstable_cache(
    fetchPublished,
    ['published-ride-groups'],
    { tags: ['ride-groups'], revalidate: 3600 },
  ),

  /** Every group including drafts, for the admin list. Not cached. */
  listAll(): Promise<RideGroup[]> {
    return scanGroups(false);
  },

  getById: (id: string) => unstable_cache(
    async () => fetchGroupById(id),
    [`ride-group-${id}`],
    { tags: ['ride-groups'], revalidate: 3600 },
  )(),

  async save(group: RideGroup): Promise<void> {
    if (!TABLE_GROUPS) throw new Error('DYNAMODB_TABLE_GROUPS is not configured.');
    await db.send(new PutCommand({ TableName: TABLE_GROUPS, Item: group }));
    console.log(`Ride group saved: ${group.id}`);
  },

  async delete(id: string): Promise<void> {
    if (!TABLE_GROUPS) throw new Error('DYNAMODB_TABLE_GROUPS is not configured.');
    await db.send(new DeleteCommand({ TableName: TABLE_GROUPS, Key: { id } }));
    console.log(`Ride group deleted: ${id}`);
  },
};
