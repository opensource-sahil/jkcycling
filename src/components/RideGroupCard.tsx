import { RideGroup } from '@/types/ride-group';
import styles from './RideGroupCard.module.css';

const LINK_LABELS: { key: keyof RideGroup['links']; label: string }[] = [
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'strava', label: 'Strava' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'website', label: 'Website' },
];

export function RideGroupCard({ group }: { group: RideGroup }) {
  const links = LINK_LABELS.filter(({ key }) => group.links?.[key]);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{group.name}</h3>
        {group.pace && <span className={styles.pace}>{group.pace}</span>}
      </div>

      {group.disciplines.length > 0 && (
        <div className={styles.tags}>
          {group.disciplines.map((d) => (
            <span key={d} className={styles.tag}>{d}</span>
          ))}
        </div>
      )}

      <p className={styles.description}>{group.description}</p>

      {(group.schedule || group.meetingPoint) && (
        <div className={styles.facts}>
          {group.schedule && (
            <span><span className={styles.factLabel}>Rides:</span> {group.schedule}</span>
          )}
          {group.meetingPoint && (
            <span><span className={styles.factLabel}>Meets at:</span> {group.meetingPoint}</span>
          )}
        </div>
      )}

      {group.contact && (group.contact.name || group.contact.phone) && (
        <p className={styles.contact}>
          {group.contact.name}
          {group.contact.name && group.contact.phone ? ' · ' : ''}
          {group.contact.phone}
        </p>
      )}

      {links.length > 0 && (
        <div className={styles.links}>
          {links.map(({ key, label }) => (
            <a
              key={key}
              href={group.links[key]}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
