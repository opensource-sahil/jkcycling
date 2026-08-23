'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { JK_DISTRICTS } from '@/types/event';
import { RIDE_DISCIPLINES, RIDE_PACES, RideGroup } from '@/types/ride-group';
import { saveRideGroupAction } from '@/app/admin/groups/actions';
import styles from './AdminForm.module.css';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={styles.submitBtn}>
      {pending ? 'Saving...' : 'Save Group'}
    </button>
  );
}

export default function RideGroupForm({ group }: { group?: RideGroup }) {
  const [disciplines, setDisciplines] = useState<string[]>(group?.disciplines || []);

  const toggleDiscipline = (value: string) => {
    setDisciplines((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
  };

  return (
    <form
      action={async (formData) => {
        formData.set('disciplines', disciplines.join(','));

        const res = await saveRideGroupAction(null, formData);
        alert(res.message);
        if (res.success) window.location.href = '/admin/groups';
      }}
      className={styles.formContainer}
    >
      <input type="hidden" name="id" value={group?.id || ''} />

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Group</h2>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>Group Name</label>
            <input required name="name" defaultValue={group?.name} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>District</label>
            <select name="district" defaultValue={group?.district || 'Srinagar'} className={styles.select}>
              {JK_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Pace</label>
            <select name="pace" defaultValue={group?.pace || ''} className={styles.select}>
              <option value="">Not specified</option>
              {RIDE_PACES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select name="status" defaultValue={group?.status || 'DRAFT'} className={styles.select}>
              <option value="DRAFT">Draft (not public)</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            required
            name="description"
            rows={4}
            defaultValue={group?.description}
            className={styles.textarea}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Disciplines</label>
          <div className={styles.checkboxGrid}>
            {RIDE_DISCIPLINES.map((d) => (
              <label key={d} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={disciplines.includes(d)}
                  onChange={() => toggleDiscipline(d)}
                />
                {d}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>Ride Schedule</label>
            <input
              name="schedule"
              defaultValue={group?.schedule}
              placeholder="Saturdays & Sundays, 6:00 am"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Meeting Point</label>
            <input
              name="meetingPoint"
              defaultValue={group?.meetingPoint}
              placeholder="Dal Gate, Srinagar"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Links</h2>
        <p className={styles.hint}>
          Only http and https links are saved; anything else is dropped.
        </p>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>WhatsApp Invite</label>
            <input
              name="link_whatsapp"
              defaultValue={group?.links?.whatsapp}
              placeholder="chat.whatsapp.com/..."
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Strava Club</label>
            <input
              name="link_strava"
              defaultValue={group?.links?.strava}
              placeholder="strava.com/clubs/..."
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Instagram</label>
            <input
              name="link_instagram"
              defaultValue={group?.links?.instagram}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Website</label>
            <input
              name="link_website"
              defaultValue={group?.links?.website}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact</h2>
        <div className={styles.grid3}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input name="contact_name" defaultValue={group?.contact?.name} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Phone</label>
            <input name="contact_phone" defaultValue={group?.contact?.phone} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input name="contact_email" defaultValue={group?.contact?.email} className={styles.input} />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  );
}
