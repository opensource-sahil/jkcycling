'use client';

import { useState } from 'react';

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
      // For convenience in dev, show the confirmation link when available
      if (data.confirmUrl) {
        setMessage(`Confirmation URL (dev): ${data.confirmUrl}`);
      }
      setEmail('');
      setName('');
      setDistrict('');
    } catch (err: any) {
      setMessage(err.message || 'Error subscribing');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mb-2">
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-2 rounded px-3 py-2 border" style={{ background: 'var(--surface)', color: 'var(--text)' }} />
        <select value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded px-3 py-2 border" style={{ background: 'var(--surface)', color: 'var(--text)' }}>
          <option value="">District (optional)</option>
          <option>Jammu</option>
          <option>Srinagar</option>
          <option>Budgam</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 rounded" style={{ background: 'var(--brand)', color: '#fff' }}>
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
        <div style={{ color: 'var(--muted)', alignSelf: 'center' }}>
          {message}
        </div>
      </div>
    </form>
  );
}
