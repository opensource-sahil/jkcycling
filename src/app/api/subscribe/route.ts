import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { subscriberService } from '@/services/subscriberService';
import { Subscriber } from '@/types/event';
import { sendEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/announcement';

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
      // Long-lived and never removed, so every later bulk email can carry a
      // working unsubscribe link.
      unsubscribeToken: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await subscriberService.addSubscriber(newSub);

    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://jkcycling.com';
    const confirmUrl = `${base}/api/confirm?token=${token}`;

    console.log('Sending Confirmation Email to:', email);
    
    // Send Email via Resend
    const emailResult = await sendEmail({
      to: email,
      subject: 'Confirm your subscription to JK Cycling',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to JK Cycling! 🚴</h2>
          <p>Hi ${escapeHtml(String(body.name || 'there'))},</p>
          <p>Thanks for subscribing to our newsletter. Please click the link below to confirm your email address:</p>
          <p style="margin: 24px 0;">
            <a href="${confirmUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Confirm Subscription
            </a>
          </p>
          <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    if (!emailResult.success) {
      // Don't fail the request, just log it. The user can try again or we can retry.
      console.error("Failed to send email", emailResult.error);
    }

    // In dev mode, still log URL for convenience
    if (process.env.NODE_ENV === 'development') {
      console.log('Confirmation URL (Dev):', confirmUrl);
    }

    return NextResponse.json({ ok: true, message: 'Confirmation email sent!' });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'subscription failed' }, { status: 500 });
  }
}