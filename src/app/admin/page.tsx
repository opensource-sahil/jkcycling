import { eventService } from "@/services/eventService";
import { isAdmin } from "@/lib/auth-utils";
import Link from "next/link";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import NotifyButton from "@/components/admin/NotifyButton";
import styles from "@/components/admin/Admin.module.css";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const isAllowed = await isAdmin();
  if (!isAllowed) {
    return (
      <div className={styles.container} style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'red', fontSize: '1.5rem', fontWeight: 'bold' }}>Access Denied</h1>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>You are not authorized to view this page.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: '2rem' }}>Go Home</Link>
      </div>
    );
  }

  const upcoming = await eventService.getUpcomingEvents();
  const past = await eventService.getPastEvents();
  const allEvents = [...upcoming, ...past];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <div className={styles.rowActions}>
          <Link href="/admin/groups" className={styles.actionLink}>
            Ride Groups
          </Link>
          <Link href="/admin/events/new" className={styles.createBtn}>
            + Create New Event
          </Link>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Title</th>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} ${styles.thRight}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allEvents.map(event => (
              <tr key={event.id} className={styles.tr}>
                <td className={styles.td} style={{ fontFamily: 'monospace' }}>{event.date}</td>
                <td className={styles.td} style={{ fontWeight: 600 }}>{event.title}</td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${event.type === 'MTB' ? styles.badgeMTB : styles.badgeRoad}`}>
                    {event.type}
                  </span>
                </td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${
                    event.status === 'UPCOMING' ? styles.badgeUpcoming : 
                    event.status === 'COMPLETED' ? styles.badgeCompleted : styles.badgeDraft
                  }`}>
                    {event.status}
                  </span>
                </td>
                <td className={styles.td}>
                  <div className={styles.rowActions}>
                    <NotifyButton
                      id={event.id}
                      title={event.title}
                      status={event.status}
                      notifiedAt={event.notifiedAt}
                    />
                    <Link href={`/admin/events/${event.id}`} className={styles.actionLink}>
                      Edit
                    </Link>
                    <DeleteEventButton id={event.id} title={event.title} />
                  </div>
                </td>
              </tr>
            ))}
            {allEvents.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>No events found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
