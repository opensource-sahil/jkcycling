import { sendEmail } from '@/lib/email';
import { subscriberService } from '@/services/subscriberService';
import { Event, Subscriber } from '@/types/event';

/**
 * Per-invocation recipient ceiling. Each recipient is a separate Resend call
 * because each needs its own unsubscribe link, so a long list will eventually
 * exceed the serverless function timeout. Revisit with a queue or Resend's
 * batch API before the list outgrows this.
 */
export const MAX_RECIPIENTS_PER_RUN = 200;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://jkcycling.com';
}

export function unsubscribeUrl(token: string, base: string = siteUrl()): string {
  return `${base}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a plain YYYY-MM-DD date without going through Date, which would
 * treat it as UTC midnight and render the previous day west of Greenwich.
 */
export function formatEventDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day || month < 1 || month > 12) return date;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function announcementSubject(event: Event): string {
  return `New race: ${event.title} — ${event.district}, ${formatEventDate(event.date)}`;
}

export function announcementHtml(
  event: Event,
  { name, unsubscribeUrl: unsubUrl, base }: { name?: string; unsubscribeUrl: string; base: string },
): string {
  const eventUrl = `${base}/events/${encodeURIComponent(event.id)}`;
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi,';

  const registration = event.registration?.isOpen && event.registration.url
    ? `<p style="margin: 24px 0;">
         <a href="${escapeHtml(event.registration.url)}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
           Register now
         </a>
       </p>`
    : '';

  const deadline = event.registration?.deadline
    ? `<p style="margin: 4px 0;"><strong>Entries close:</strong> ${escapeHtml(formatEventDate(event.registration.deadline.slice(0, 10)))}</p>`
    : '';

  const fee = event.registration?.fee
    ? `<p style="margin: 4px 0;"><strong>Entry fee:</strong> ${escapeHtml(event.registration.fee)}</p>`
    : '';

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <p style="font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase; color: #666; margin: 0 0 4px;">
        ${escapeHtml(event.district)} · ${escapeHtml(event.type)}
      </p>
      <h2 style="margin: 0 0 16px;">${escapeHtml(event.title)}</h2>
      <p>${greeting}</p>
      <p>A new race has been added to the JK Cycling calendar.</p>
      <p style="margin: 4px 0;"><strong>Date:</strong> ${escapeHtml(formatEventDate(event.date))}</p>
      <p style="margin: 4px 0;"><strong>Where:</strong> ${escapeHtml(event.location)}, ${escapeHtml(event.district)}</p>
      ${fee}
      ${deadline}
      <p style="margin-top: 16px;">${escapeHtml(event.description)}</p>
      ${registration}
      <p><a href="${eventUrl}">See full event details</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
      <p style="font-size: 12px; color: #888;">
        You're receiving this because you subscribed to race updates at jkcycling.com.
        <a href="${unsubUrl}" style="color: #888;">Unsubscribe</a>.
      </p>
    </div>
  `;
}

export type SendReport = {
  sent: number;
  failed: { email: string; error: string }[];
  /** Recipients beyond MAX_RECIPIENTS_PER_RUN that were not emailed. */
  skipped: number;
};

/**
 * Email every supplied subscriber about an event. One send per recipient, as
 * each carries a personal unsubscribe link. A failure for one address is
 * recorded and the run continues.
 */
export async function sendEventAnnouncement(
  event: Event,
  subscribers: Subscriber[],
): Promise<SendReport> {
  const base = siteUrl();
  const recipients = subscribers.slice(0, MAX_RECIPIENTS_PER_RUN);
  const skipped = subscribers.length - recipients.length;

  if (skipped > 0) {
    console.warn(
      `Recipient list of ${subscribers.length} exceeds the per-run cap of ${MAX_RECIPIENTS_PER_RUN}; ${skipped} subscriber(s) were not emailed.`,
    );
  }

  const subject = announcementSubject(event);
  const report: SendReport = { sent: 0, failed: [], skipped };

  for (const subscriber of recipients) {
    try {
      const token = await subscriberService.ensureUnsubscribeToken(subscriber);
      const unsubUrl = unsubscribeUrl(token, base);

      const result = await sendEmail({
        to: subscriber.email,
        subject,
        html: announcementHtml(event, { name: subscriber.name, unsubscribeUrl: unsubUrl, base }),
        headers: {
          // RFC 8058: lets Gmail and Outlook show a native unsubscribe button
          // that POSTs directly, never rendering our confirmation page.
          'List-Unsubscribe': `<${unsubUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      });

      if (result.success) {
        report.sent++;
      } else {
        report.failed.push({ email: subscriber.email, error: String(result.error) });
      }
    } catch (error) {
      report.failed.push({
        email: subscriber.email,
        error: error instanceof Error ? error.message : 'unknown error',
      });
    }
  }

  return report;
}
