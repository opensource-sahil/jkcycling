import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  const store = readStore();
  const sub = store.subscribers.find((s: any) => s.token === token);
  if (!sub) return NextResponse.json({ error: 'invalid token' }, { status: 404 });

  sub.status = 'confirmed';
  sub.confirmed_at = new Date().toISOString();
  // remove token so it can't be reused
  delete sub.token;
  writeStore(store);

  // Redirect to a simple confirmation page or return JSON
  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return NextResponse.redirect(new URL('/?sub_confirmed=1', redirectTo));
}
