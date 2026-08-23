import Link from "next/link";
import { isAdmin } from "@/lib/auth-utils";
import { rideGroupService } from "@/services/rideGroupService";
import DeleteGroupButton from "@/components/admin/DeleteGroupButton";
import styles from "@/components/admin/Admin.module.css";

export const dynamic = 'force-dynamic';

export default async function AdminGroupsPage() {
  const isAllowed = await isAdmin();
  if (!isAllowed) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1 className={styles.pageHeading}>Access Denied</h1>
        <Link href="/" className="btn btn-primary">Go Home</Link>
      </div>
    );
  }

  const groups = await rideGroupService.listAll();

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Ride Groups</h1>
        <Link href="/admin/groups/new" className={styles.createBtn}>
          + Add Group
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>District</th>
              <th className={styles.th}>Disciplines</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} ${styles.thRight}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className={styles.tr}>
                <td className={styles.td} style={{ fontWeight: 600 }}>{group.name}</td>
                <td className={styles.td}>{group.district}</td>
                <td className={styles.td}>{group.disciplines.join(', ') || '—'}</td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${
                    group.status === 'PUBLISHED' ? styles.badgeUpcoming : styles.badgeDraft
                  }`}>
                    {group.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.rowActions}>
                    <Link href={`/admin/groups/${group.id}`} className={styles.actionLink}>
                      Edit
                    </Link>
                    <DeleteGroupButton id={group.id} name={group.name} />
                  </div>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  No ride groups yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
