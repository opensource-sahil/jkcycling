'use client';

import { useState } from 'react';
import styles from './SubscribeForm.module.css';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, district }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setMessage('Check console/server logs for a local confirmation link (dev).');
      if (data.confirmUrl) {
        setMessage(`Confirmation URL (dev): ${data.confirmUrl}`);
      }
      setEmail('');
      setName('');
      setDistrict('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error subscribing');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h3 className={styles.title}>Stay Updated with JK Cycling</h3>
      <div className={styles.formGroup}>
        <input 
          type="text" 
          placeholder="Your Name (optional)" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className={styles.input}
        />
        <input 
          type="email" 
          required 
          placeholder="Your Email Address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className={styles.input}
        />
        <select 
          value={district} 
          onChange={(e) => setDistrict(e.target.value)} 
          className={styles.select}
        >
          <option value="">Select your District (optional)</option>
          <option>Jammu</option>
          <option>Srinagar</option>
          <option>Budgam</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className={`btn btn-primary ${styles.button}`}>
        {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
      </button>
      {message && (
        <div className={styles.message}>
          {message}
        </div>
      )}
    </form>
  );
}