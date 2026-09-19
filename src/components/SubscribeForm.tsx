'use client';

import { useState } from 'react';
import styles from './SubscribeForm.module.css';
import { JK_DISTRICTS } from '@/types/event';

interface SubscribeFormProps {
  variant?: 'stacked' | 'inline';
}

export default function SubscribeForm({ variant = 'stacked' }: SubscribeFormProps) {
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

      setMessage(data.message || 'Check your email for a confirmation link!');

      setEmail('');
      setName('');
      setDistrict('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error subscribing');
    } finally {
      setLoading(false);
    }
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className={styles.inlineForm}>
        <div className={styles.inlineRow}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`input ${styles.inlineInput}`}
          />
          <button type="submit" disabled={loading} className="btn btn--primary">
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        {message && <div className={styles.inlineMessage}>{message}</div>}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h3 className={styles.title}>Stay Updated with JK Cycling</h3>
      <div className={styles.fields}>
        <div className={`field ${styles.field}`}>
          <label htmlFor="subscribe-name">Name (optional)</label>
          <input
            id="subscribe-name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </div>
        <div className={`field ${styles.field}`}>
          <label htmlFor="subscribe-email">Email</label>
          <input
            id="subscribe-email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
        <div className={`field ${styles.field}`}>
          <label htmlFor="subscribe-district">District (optional)</label>
          <select
            id="subscribe-district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="input"
          >
            <option value="">Select your district</option>
            {JK_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn btn--primary btn--block">
        {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
      </button>
      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
