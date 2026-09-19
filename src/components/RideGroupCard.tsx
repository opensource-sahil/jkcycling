import { RideGroup, RidePace } from '@/types/ride-group';
import styles from './RideGroupCard.module.css';

const LINK_LABELS: { key: keyof RideGroup['links']; label: string }[] = [
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'strava', label: 'Strava' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'website', label: 'Website' },
];

const PACE_BADGE_TONE: Record<RidePace, string> = {
  'Beginner friendly': 'badge badge--success',
  Intermediate: 'badge badge--warning',
  Fast: 'badge badge--danger',
  'All paces welcome': 'badge badge--info',
};

export function RideGroupCard({ group }: { group: RideGroup }) {
  const links = LINK_LABELS.filter(({ key }) => group.links?.[key]);
  const contactLine = group.contact
    ? [group.contact.name, group.contact.phone, group.contact.email]
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <article className={`card ${styles.card}`}>
      <div className={styles.head}>
        <h3 className={styles.name}>{group.name}</h3>
        {group.pace && (
          <span className={PACE_BADGE_TONE[group.pace]}>{group.pace}</span>
        )}
      </div>

      {group.disciplines.length > 0 && (
        <div className="chips">
          {group.disciplines.map((discipline) => (
            <span key={discipline} className="chip">
              {discipline}
            </span>
          ))}
        </div>
      )}

      <p className={styles.description}>{group.description}</p>

      {(group.schedule || group.meetingPoint) && (
        <div className={styles.facts}>
          {group.schedule && (
            <div className={styles.fact}>
              <span className={styles.factKey}>Rides</span>
              <span className={styles.factValue}>{group.schedule}</span>
            </div>
          )}
          {group.meetingPoint && (
            <div className={styles.fact}>
              <span className={styles.factKey}>Meets</span>
              <span className={styles.factValue}>{group.meetingPoint}</span>
            </div>
          )}
        </div>
      )}

      {contactLine && (
        <p className={styles.contact}>
          <span className={styles.factKey}>Contact</span> {contactLine}
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
              className="btn btn--secondary btn--sm"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
