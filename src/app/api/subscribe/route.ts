import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_FILE = path.resolve(process.cwd(), 'src', 'data', 'subscribers.json');

function readStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { subscribers: [] };
  }
}

function writeStore(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const email = String(body.email).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }

  const store = readStore();
  const existing = store.subscribers.find((s: any) => s.email === email);
  if (existing) {
    // If already confirmed, just return success; if pending, resend would be appropriate.
    return NextResponse.json({ ok: true, message: 'already subscribed' });
  }

  const token = randomUUID();
  const newSub = {
    id: randomUUID(),
    email,
    name: body.name || null,
    district: body.district || null,
    status: 'pending',
    token,
    created_at: new Date().toISOString(),
  };
  store.subscribers.push(newSub);
  writeStore(store);

  // In a production implementation we'd send a real double-opt-in email here using SES.
  // For now we return the confirmation link so you can test the flow locally.
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const confirmUrl = `${base}/api/confirm?token=${token}`;

  // Log the confirmation URL for convenience (visible in server logs)
  // eslint-disable-next-line no-console
  console.log('Confirmation URL:', confirmUrl);

  return NextResponse.json({ ok: true, confirmUrl });
}
