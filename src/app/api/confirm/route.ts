import { NextResponse } from 'next/server';
import { subscriberService } from '@/services/subscriberService';
import { sendEmail } from '@/lib/email';

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

    // Send Welcome Email
    await sendEmail({
      to: sub.email,
      subject: 'Subscription Confirmed! 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You are now subscribed!</h2>
          <p>Hi ${sub.name || 'Cycling Enthusiast'},</p>
          <p>Your subscription to JK Cycling updates has been confirmed.</p>
          <p>We'll keep you posted on upcoming MTB and Road races in Jammu & Kashmir.</p>
          <br/>
          <p>See you at the start line! 🏁</p>
          <p>- JK Cycling Team</p>
        </div>
      `
    });

    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || 'https://jkcycling.com';
    return NextResponse.redirect(new URL('/?sub_confirmed=1', redirectTo));
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ error: 'confirmation failed' }, { status: 500 });
  }
}