import { NextResponse } from 'next/server';
import { subscriberService } from '@/services/subscriberService';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  try {
    const sub = await subscriberService.getSubscriberByToken(token);
    if (!sub) return NextResponse.json({ error: 'invalid token' }, { status: 404 });

    sub.status = 'confirmed';
    sub.confirmedAt = new Date().toISOString();
    // remove token so it can't be reused
    delete sub.token;

    await subscriberService.addSubscriber(sub);

    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/?sub_confirmed=1', redirectTo));
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ error: 'confirmation failed' }, { status: 500 });
  }
}