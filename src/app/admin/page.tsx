'use client';

import { useState } from 'react';
import { generateEventId } from '@/lib/utils';

function downloadJSON(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [district, setDistrict] = useState('');
  const [type, setType] = useState<'MTB' | 'Road'>('MTB');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [image, setImage] = useState('/images/events/placeholder.jpg');
  const [jsonOutput, setJsonOutput] = useState('');
  const [copied, setCopied] = useState(false);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const id = generateEventId(title || 'event', date || new Date().toISOString().slice(0,10));
    const obj = {
      id,
      title,
      date,
      district,
      type,
      description,
      location,
      registrationUrl,
      notice,
      image,
    };
    const json = JSON.stringify(obj, null, 2);
    setJsonOutput(json);
  }

  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto rounded-lg shadow p-6" style={{ background: 'var(--surface)' }}>
        <h1 className="text-2xl font-bold mb-4">Admin — Create event JSON</h1>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded px-3 py-2 border"
              style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Date</label>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="mt-1 block w-full rounded px-3 py-2 border"
                  style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}
                />
            </div>
            <div>
              <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>District</label>
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 block w-full rounded px-3 py-2 border"
                style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'MTB'|'Road')}
                className="mt-1 block w-full rounded px-3 py-2 border"
                style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}
              >
                <option value="MTB">MTB</option>
                <option value="Road">Road</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full rounded px-3 py-2 border"
                style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded px-3 py-2 border"
              style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Registration URL</label>
              <input
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                className="mt-1 block w-full rounded px-3 py-2 border"
                style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Notice URL</label>
              <input
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                className="mt-1 block w-full rounded px-3 py-2 border"
                style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Image URL</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 block w-full rounded px-3 py-2 border"
              style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">Generate JSON</button>
            <button type="button" onClick={() => { setTitle(''); setDate(''); setDistrict(''); setType('MTB'); setLocation(''); setDescription(''); setRegistrationUrl(''); setNotice(''); setImage('/images/events/placeholder.jpg'); setJsonOutput(''); setCopied(false); }} className="px-4 py-2 border rounded" style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'rgba(148,163,184,0.4)' }}>Reset</button>
          </div>
        </form>

        {jsonOutput && (
          <div className="mt-6">
            <label className="block text-sm font-semibold" style={{ color: 'var(--text)' }}>Event JSON</label>
            <textarea readOnly value={jsonOutput} className="mt-1 block w-full rounded border border-gray-300 bg-gray-900 text-white font-mono text-sm px-3 py-2" rows={10} />
            <div className="flex gap-3 mt-3 items-center">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(jsonOutput);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  } catch (err) {
                    // fallback: noop
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-pressed={copied}
              >
                {copied ? 'Copied ✓' : 'Copy JSON'}
              </button>
              <button onClick={() => downloadJSON('event.json', jsonOutput)} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-black focus:outline-none focus:ring-2 focus:ring-gray-700">Download .json</button>
              <div role="status" aria-live="polite" className="sr-only">
                {copied ? 'JSON copied to clipboard' : ''}
              </div>
            </div>

            <p className="mt-3 text-sm" style={{ color: 'var(--muted)' }}>
              Tip: Add the generated object to <code style={{ background: 'var(--surface)', padding: '0.125rem 0.25rem', borderRadius: 4 }}>src/data/events/events.json</code> or create a new file under that folder and open a PR to merge.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
