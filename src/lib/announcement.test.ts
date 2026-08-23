import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Event, Subscriber } from '@/types/event';

const mocks = vi.hoisted(() => ({
  sendEmail: vi.fn(),
  ensureUnsubscribeToken: vi.fn(),
}));

vi.mock('@/lib/email', () => ({ sendEmail: mocks.sendEmail }));
vi.mock('@/services/subscriberService', () => ({
  subscriberService: { ensureUnsubscribeToken: mocks.ensureUnsubscribeToken },
}));

const {
  MAX_RECIPIENTS_PER_RUN,
  announcementHtml,
  announcementSubject,
  escapeHtml,
  formatEventDate,
  sendEventAnnouncement,
  unsubscribeUrl,
} = await import('@/lib/announcement');

const BASE = 'https://example.test';

function event(overrides: Partial<Event> = {}): Event {
  return {
    id: '2026-05-01-srinagar-classic',
    title: 'Srinagar Classic',
    date: '2026-05-01',
    district: 'Srinagar',
    type: 'Road',
    description: 'A road race around the lake.',
    location: 'Dal Lake Circuit',
    image: '/images/events/srinagar.jpg',
    categories: ['Men Elite'],
    registration: { isOpen: true, url: 'https://forms.test/enter' },
    status: 'UPCOMING',
    audit: { createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
    ...overrides,
  };
}

function subscriber(overrides: Partial<Subscriber> = {}): Subscriber {
  return {
    id: 'sub-1',
    email: 'rider@example.test',
    district: 'Srinagar',
    status: 'confirmed',
    createdAt: '2026-01-01T00:00:00.000Z',
    unsubscribeToken: 'tok-1',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SITE_URL = BASE;
  mocks.sendEmail.mockResolvedValue({ success: true });
  mocks.ensureUnsubscribeToken.mockImplementation(async (s: Subscriber) => s.unsubscribeToken ?? 'generated');
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

describe('escapeHtml', () => {
  it('neutralises markup', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;',
    );
  });

  it('escapes ampersands before entities are formed', () => {
    expect(escapeHtml('Tour & Trail')).toBe('Tour &amp; Trail');
  });
});

describe('formatEventDate', () => {
  it('formats a plain date', () => {
    expect(formatEventDate('2026-05-01')).toBe('1 May 2026');
  });

  it('does not shift the day for early-month dates', () => {
    // new Date('2026-01-01') is UTC midnight and renders as 31 Dec west of
    // Greenwich; parsing the parts directly avoids that entirely.
    expect(formatEventDate('2026-01-01')).toBe('1 January 2026');
  });

  it('returns the input unchanged when it is not a plain date', () => {
    expect(formatEventDate('not-a-date')).toBe('not-a-date');
  });
});

describe('unsubscribeUrl', () => {
  it('builds an absolute url with an encoded token', () => {
    expect(unsubscribeUrl('a b/c', BASE)).toBe(`${BASE}/api/unsubscribe?token=a%20b%2Fc`);
  });
});

describe('announcementSubject', () => {
  it('names the race, district and date', () => {
    expect(announcementSubject(event())).toBe('New race: Srinagar Classic — Srinagar, 1 May 2026');
  });
});

describe('announcementHtml', () => {
  const render = (e: Event, name?: string) =>
    announcementHtml(e, { name, unsubscribeUrl: `${BASE}/api/unsubscribe?token=tok-1`, base: BASE });

  it('leads with the district so distant readers can skip it', () => {
    expect(render(event())).toContain('Srinagar');
  });

  it('always carries an unsubscribe link', () => {
    expect(render(event())).toContain(`${BASE}/api/unsubscribe?token=tok-1`);
  });

  it('links to the event page', () => {
    expect(render(event())).toContain(`${BASE}/events/2026-05-01-srinagar-classic`);
  });

  it('escapes a title containing markup', () => {
    const html = render(event({ title: 'Race <b>One</b>' }));
    expect(html).toContain('Race &lt;b&gt;One&lt;/b&gt;');
    expect(html).not.toContain('<b>One</b>');
  });

  it('escapes a subscriber name containing markup', () => {
    expect(render(event(), '<img onerror=x>')).not.toContain('<img onerror=x>');
  });

  it('shows a register button when registration is open', () => {
    expect(render(event())).toContain('Register now');
  });

  it('omits the register button when registration is closed', () => {
    expect(render(event({ registration: { isOpen: false } }))).not.toContain('Register now');
  });

  it('omits the register button when open but with no url', () => {
    expect(render(event({ registration: { isOpen: true } }))).not.toContain('Register now');
  });
});

describe('sendEventAnnouncement', () => {
  it('sends one email per subscriber', async () => {
    const report = await sendEventAnnouncement(event(), [
      subscriber({ email: 'a@example.test', unsubscribeToken: 'tok-a' }),
      subscriber({ email: 'b@example.test', unsubscribeToken: 'tok-b' }),
    ]);

    expect(report).toEqual({ sent: 2, failed: [], skipped: 0 });
    expect(mocks.sendEmail).toHaveBeenCalledTimes(2);
  });

  it('gives each recipient their own unsubscribe headers', async () => {
    await sendEventAnnouncement(event(), [subscriber({ unsubscribeToken: 'tok-a' })]);

    const call = mocks.sendEmail.mock.calls[0][0];
    expect(call.headers['List-Unsubscribe']).toBe(`<${BASE}/api/unsubscribe?token=tok-a>`);
    expect(call.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });

  it('backfills a token for subscribers that predate the field', async () => {
    mocks.ensureUnsubscribeToken.mockResolvedValue('fresh-token');

    await sendEventAnnouncement(event(), [subscriber({ unsubscribeToken: undefined })]);

    expect(mocks.ensureUnsubscribeToken).toHaveBeenCalled();
    expect(mocks.sendEmail.mock.calls[0][0].headers['List-Unsubscribe']).toContain('fresh-token');
  });

  it('records a failure and keeps going', async () => {
    mocks.sendEmail
      .mockResolvedValueOnce({ success: false, error: 'rejected' })
      .mockResolvedValueOnce({ success: true });

    const report = await sendEventAnnouncement(event(), [
      subscriber({ email: 'bad@example.test' }),
      subscriber({ email: 'good@example.test' }),
    ]);

    expect(report.sent).toBe(1);
    expect(report.failed).toEqual([{ email: 'bad@example.test', error: 'rejected' }]);
  });

  it('records a thrown error without aborting the run', async () => {
    mocks.sendEmail.mockRejectedValueOnce(new Error('network down'));

    const report = await sendEventAnnouncement(event(), [
      subscriber({ email: 'bad@example.test' }),
      subscriber({ email: 'good@example.test' }),
    ]);

    expect(report.sent).toBe(1);
    expect(report.failed[0].error).toBe('network down');
  });

  it('caps a run and reports what it skipped rather than truncating silently', async () => {
    const many = Array.from({ length: MAX_RECIPIENTS_PER_RUN + 5 }, (_, i) =>
      subscriber({ email: `r${i}@example.test`, unsubscribeToken: `tok-${i}` }),
    );

    const report = await sendEventAnnouncement(event(), many);

    expect(report.sent).toBe(MAX_RECIPIENTS_PER_RUN);
    expect(report.skipped).toBe(5);
    expect(mocks.sendEmail).toHaveBeenCalledTimes(MAX_RECIPIENTS_PER_RUN);
  });
});
