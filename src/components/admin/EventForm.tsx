'use client';

import { useState } from 'react';
import { Event, EventStatus, JK_DISTRICTS, RACE_CATEGORIES } from "@/types/event";
import { saveEventAction } from "@/app/admin/actions";
import { useFormStatus } from "react-dom";
import PodiumEditor from "./PodiumEditor";
import styles from "./AdminForm.module.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

/** Presign, PUT to S3, and return the public URL of the stored object. */
async function uploadFile(file: File): Promise<string> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: JSON.stringify({ filename: file.name, filetype: file.type }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || 'Failed to get upload URL');
  }

  const { signedUrl, publicUrl } = await res.json();

  const uploadRes = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${uploadRes.statusText}`);
  }

  return publicUrl;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={styles.submitBtn}>
      {pending ? 'Saving...' : 'Save Event'}
    </button>
  );
}

export default function EventForm({ event }: { event?: Event }) {
  const [selectedCats, setSelectedCats] = useState<string[]>(event?.categories || []);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(event?.image || '');
  const [status, setStatus] = useState<EventStatus>(event?.status || 'UPCOMING');
  const [noticeUrl, setNoticeUrl] = useState(event?.notice || '');
  const [isUploadingNotice, setIsUploadingNotice] = useState(false);

  const isCompleted = status === 'COMPLETED';

  const toggleCategory = (cat: string) => {
    setSelectedCats(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      alert("Image is too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    try {
      setImageUrl(await uploadFile(file));
    } catch (err) {
      console.error("Upload Error:", err);
      alert(err instanceof Error ? err.message : "Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNoticeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Please choose a PDF file");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      alert("PDF is too large (max 10MB)");
      return;
    }

    setIsUploadingNotice(true);
    try {
      setNoticeUrl(await uploadFile(file));
    } catch (err) {
      console.error("Upload Error:", err);
      alert(err instanceof Error ? err.message : "Error uploading PDF");
    } finally {
      setIsUploadingNotice(false);
    }
  };

  return (
    <form action={async (formData) => {
        // Append manual fields
        formData.set("categories", selectedCats.join(','));
        formData.set("image", imageUrl); // Ensure the uploaded URL is sent
        formData.set("notice", noticeUrl);

        const res = await saveEventAction(null, formData);
        if (res.success) {
            alert(res.message);
            window.location.href = '/admin';
        } else {
            alert(res.message);
        }
    }} className={styles.formContainer}>
      
      <input type="hidden" name="id" value={event?.id || ''} />

      {/* Basic Info */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Info</h2>
        
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>Event Title</label>
            <input required name="title" defaultValue={event?.title} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Date</label>
            <input required type="date" name="date" defaultValue={event?.date} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>District</label>
            <select name="district" defaultValue={event?.district || 'Jammu'} className={styles.select}>
              {JK_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <select name="type" defaultValue={event?.type || 'MTB'} className={styles.select}>
              <option value="MTB">MTB</option>
              <option value="Road">Road</option>
              <option value="Cyclocross">Cyclocross</option>
              <option value="Downhill">Downhill</option>
              <option value="Enduro">Enduro</option>
              <option value="BMX">BMX</option>
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea required name="description" rows={4} defaultValue={event?.description} className={styles.textarea} />
        </div>
        
        <div className={styles.grid2}>
            <div className={styles.field}>
                <label className={styles.label}>Location</label>
                <input required name="location" defaultValue={event?.location} className={styles.input} />
            </div>
            <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <select
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EventStatus)}
                    className={styles.select}
                >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="DRAFT">Draft</option>
                </select>
            </div>
        </div>
        
        <div className={styles.field}>
             <label className={styles.label}>Race Categories</label>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                {RACE_CATEGORIES.map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedCats.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                    />
                    {cat}
                  </label>
                ))}
             </div>
        </div>
        
        <div className={styles.field}>
            <label className={styles.label}>Event Poster (Image)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className={styles.input} 
                    style={{ padding: '0.5rem' }}
                />
                {isUploading && <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Uploading...</span>}
            </div>
            
            <input 
                name="image" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                placeholder="Or enter URL manually" 
                className={styles.input} 
                style={{ marginTop: '0.5rem' }}
            />
            
            {imageUrl && (
                <div style={{ marginTop: '1rem', width: '150px', height: '100px', position: 'relative', overflow: 'hidden', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            )}
        </div>

        <div className={styles.field}>
            <label className={styles.label}>
                {isCompleted ? 'Results PDF' : 'Event Notice (PDF)'}
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleNoticeChange}
                    className={styles.input}
                    style={{ padding: '0.5rem' }}
                />
                {isUploadingNotice && <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Uploading...</span>}
            </div>

            <input
                value={noticeUrl}
                onChange={(e) => setNoticeUrl(e.target.value)}
                placeholder="Or enter PDF URL manually"
                className={styles.input}
                style={{ marginTop: '0.5rem' }}
            />

            {noticeUrl && (
                <a
                    href={noticeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}
                >
                    Preview attached PDF →
                </a>
            )}
        </div>
      </div>

      {/* Registration Details */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Registration Details</h2>
        
        <div className={styles.checkboxWrapper}>
            <input type="checkbox" name="reg_isOpen" id="reg_isOpen" defaultChecked={event?.registration?.isOpen} style={{ width: 20, height: 20 }} />
            <label htmlFor="reg_isOpen" className={styles.label}>Registration Open?</label>
        </div>

        <div className={styles.grid3}>
            <div className={styles.field}>
                <label className={styles.label}>Link (Google Form etc)</label>
                <input name="reg_url" defaultValue={event?.registration?.url} className={styles.input} />
            </div>
            <div className={styles.field}>
                <label className={styles.label}>Fee (e.g., 500 INR)</label>
                <input name="reg_fee" defaultValue={event?.registration?.fee} className={styles.input} />
            </div>
            <div className={styles.field}>
                <label className={styles.label}>Deadline</label>
                <input type="date" name="reg_deadline" defaultValue={event?.registration?.deadline ? new Date(event.registration.deadline).toISOString().split('T')[0] : ''} className={styles.input} />
            </div>
        </div>
      </div>

      {/* Organizer */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Organizer</h2>
        <div className={styles.grid3}>
            <div className={styles.field}>
                <label className={styles.label}>Org Name</label>
                <input name="org_name" defaultValue={event?.organizer?.name} className={styles.input} />
            </div>
             <div className={styles.field}>
                <label className={styles.label}>Contact Person</label>
                <input name="org_contact_name" defaultValue={event?.organizer?.contact?.name} className={styles.input} />
            </div>
             <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input name="org_contact_phone" defaultValue={event?.organizer?.contact?.phone} className={styles.input} />
            </div>
        </div>
      </div>

      {/* Results — only for completed events. When this section is absent the
          form submits no `results` field, and the action keeps what is stored. */}
      {isCompleted && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Podium Results</h2>
          <PodiumEditor categories={selectedCats} initialResults={event?.results} />
        </div>
      )}

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  );
}