import { Metadata } from 'next';
import { rideGroupService } from '@/services/rideGroupService';
import { RideGroupCard } from '@/components/RideGroupCard';
import { RideGroup } from '@/types/ride-group';
import styles from './Groups.module.css';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Ride Groups',
  description:
    'Find cycling clubs and group rides across Jammu & Kashmir — WhatsApp groups, Strava clubs and the people to ride with in your district.',
};

function groupByDistrict(groups: RideGroup[]) {
  const byDistrict = new Map<string, RideGroup[]>();
  for (const group of groups) {
    const district = group.district || 'Elsewhere';
    const existing = byDistrict.get(district);
    if (existing) existing.push(group);
    else byDistrict.set(district, [group]);
  }
  return [...byDistrict.entries()];
}

export default async function GroupsPage() {
  const groups = await rideGroupService.listPublished();
  const districts = groupByDistrict(groups);

  return (
    <>
      <h1 className={styles.pageTitle}>Ride Groups</h1>
      <p className={styles.intro}>
        Clubs and informal groups riding across Jammu &amp; Kashmir. Reach out
        before you turn up — most groups are happy to have new riders along,
        and it is worth checking the pace and the meeting point first.
      </p>

      {districts.length === 0 ? (
        <p className={styles.empty}>
          No ride groups listed yet. If you run one, get in touch and we will add it.
        </p>
      ) : (
        districts.map(([district, districtGroups]) => (
          <section key={district} className={styles.district}>
            <h2 className={styles.districtName}>{district}</h2>
            <div className={styles.grid}>
              {districtGroups.map((group) => (
                <RideGroupCard key={group.id} group={group} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
