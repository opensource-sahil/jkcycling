import { NextResponse } from 'next/server';
import { subscriberService } from '@/services/subscriberService';
import { escapeHtml } from '@/lib/announcement';

/**
 * GET renders a confirmation page and changes nothing. Mail clients and
 * security scanners prefetch links, so a state-changing GET would silently
 * unsubscribe people who never clicked.
 *
 * POST performs the unsubscribe, both from the page's button and from the
 * RFC 8058 one-click header that Gmail and Outlook use.
 */

function htmlPage(heading: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${escapeHtml(heading)} · JK Cycling</title>
  <style>
    :root { color-scheme: light dark; --bg: #fff; --surface: #f8f9fa; --text: #111; --muted: #666; --border: #e5e7eb; --primary: #0070f3; }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #0a0a0a; --surface: #141414; --text: #f5f5f5; --muted: #a1a1a1; --border: #2a2a2a; }
    }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 1.5rem;
           background: var(--bg); color: var(--text);
           font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    .card { width: 100%; max-width: 30rem; background: var(--surface); border: 1px solid var(--border);
            border-radius: 12px; padding: 2rem; }
    h1 { margin: 0 0 0.75rem; font-size: 1.35rem; }
    p { margin: 0 0 1rem; color: var(--muted); line-height: 1.6; }
    button { background: var(--primary); color: #fff; border: none; border-radius: 6px;
             padding: 0.75rem 1.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
    button:hover { opacity: 0.9; }
    a { color: var(--primary); }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(heading)}</h1>
    ${body}
  </div>
</body>
</html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

const backLink = '<p><a href="/">Back to JK Cycling</a></p>';

function invalidLink() {
  return htmlPage(
    'This link is no longer valid',
    `<p>We could not find a subscription for this link. It may already have been used, or the address may have been removed.</p>${backLink}`,
    404,
  );
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) return invalidLink();

  try {
    const subscriber = await subscriberService.getSubscriberByUnsubscribeToken(token);
    if (!subscriber) return invalidLink();

    if (subscriber.status === 'unsubscribed') {
      return htmlPage(
        'You are already unsubscribed',
        `<p>You will not receive any further race updates from JK Cycling.</p>${backLink}`,
      );
    }

    return htmlPage(
      'Unsubscribe from race updates?',
      `<p>You will stop receiving emails about new races in Jammu &amp; Kashmir.</p>
       <form method="post" action="/api/unsubscribe?token=${encodeURIComponent(token)}">
         <button type="submit">Yes, unsubscribe me</button>
       </form>
       <p style="margin-top:1.5rem"><a href="/">No, keep me subscribed</a></p>`,
    );
  } catch (error) {
    console.error('Unsubscribe lookup failed:', error);
    return htmlPage(
      'Something went wrong',
      `<p>We could not process that just now. Please try again shortly.</p>${backLink}`,
      500,
    );
  }
}

export async function POST(request: Request) {
  let token = new URL(request.url).searchParams.get('token');

  // One-click clients POST to the List-Unsubscribe URL, which carries the
  // token; fall back to a form body for anything that posts it there instead.
  if (!token) {
    const body = await request.text().catch(() => '');
    token = new URLSearchParams(body).get('token');
  }

  if (!token) return invalidLink();

  try {
    const subscriber = await subscriberService.getSubscriberByUnsubscribeToken(token);
    if (!subscriber) return invalidLink();

    if (subscriber.status !== 'unsubscribed') {
      await subscriberService.unsubscribe(subscriber);
    }

    return htmlPage(
      'You have been unsubscribed',
      `<p>You will not receive any further race updates. If this was a mistake, you can subscribe again from the site.</p>${backLink}`,
    );
  } catch (error) {
    console.error('Unsubscribe failed:', error);
    return htmlPage(
      'Something went wrong',
      `<p>We could not complete that just now. Please try again shortly.</p>${backLink}`,
      500,
    );
  }
}
