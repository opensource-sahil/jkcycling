import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { subscriberService } from '@/services/subscriberService';
import { Subscriber } from '@/types/event';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const email = String(body.email).trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }

  try {
    const existing = await subscriberService.getSubscriber(email);
    if (existing) {
      if (existing.status === 'confirmed') {
        return NextResponse.json({ ok: true, message: 'already subscribed' });
      }
      // If pending, we could resend the token, but for now just return success
      return NextResponse.json({ ok: true, message: 'subscription pending confirmation' });
    }

    const token = randomUUID();
    const newSub: Subscriber = {
      id: randomUUID(),
      email,
      name: body.name || undefined,
      district: body.district || 'Unknown',
      status: 'pending',
      token,
      createdAt: new Date().toISOString(),
    };

    await subscriberService.addSubscriber(newSub);

    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const confirmUrl = `${base}/api/confirm?token=${token}`;

    // eslint-disable-next-line no-console
    console.log('Confirmation URL:', confirmUrl);

    return NextResponse.json({ ok: true, confirmUrl });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'subscription failed' }, { status: 500 });
  }
}