import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Subscriber } from '@/types/event';

const mocks = vi.hoisted(() => ({
  getSubscriberByUnsubscribeToken: vi.fn(),
  unsubscribe: vi.fn(),
}));

vi.mock('@/services/subscriberService', () => ({
  subscriberService: {
    getSubscriberByUnsubscribeToken: mocks.getSubscriberByUnsubscribeToken,
    unsubscribe: mocks.unsubscribe,
  },
}));
vi.mock('@/lib/email', () => ({ sendEmail: vi.fn() }));

const { GET, POST } = await import('@/app/api/unsubscribe/route');

const URL_BASE = 'https://example.test/api/unsubscribe';

function confirmed(overrides: Partial<Subscriber> = {}): Subscriber {
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

const get = (query = '?token=tok-1') => GET(new Request(`${URL_BASE}${query}`));
const post = (query = '?token=tok-1', body?: string) =>
  POST(
    new Request(`${URL_BASE}${query}`, {
      method: 'POST',
      body,
      headers: body ? { 'content-type': 'application/x-www-form-urlencoded' } : undefined,
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSubscriberByUnsubscribeToken.mockResolvedValue(confirmed());
  mocks.unsubscribe.mockResolvedValue(undefined);
});

describe('GET /api/unsubscribe', () => {
  it('never unsubscribes, because scanners and mail clients prefetch links', async () => {
    const res = await get();

    expect(res.status).toBe(200);
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
  });

  it('offers a form that posts back with the token', async () => {
    const body = await (await get()).text();

    expect(body).toContain('method="post"');
    expect(body).toContain('/api/unsubscribe?token=tok-1');
  });

  it('404s without a token and does not hit the database', async () => {
    const res = await get('');

    expect(res.status).toBe(404);
    expect(mocks.getSubscriberByUnsubscribeToken).not.toHaveBeenCalled();
  });

  it('404s for an unknown token', async () => {
    mocks.getSubscriberByUnsubscribeToken.mockResolvedValue(null);

    expect((await get()).status).toBe(404);
  });

  it('tells an already-unsubscribed reader they are done', async () => {
    mocks.getSubscriberByUnsubscribeToken.mockResolvedValue(confirmed({ status: 'unsubscribed' }));

    const res = await get();

    expect(res.status).toBe(200);
    expect(await res.text()).toContain('already unsubscribed');
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
  });

  it('reports a lookup failure as a 500 rather than a blank page', async () => {
    mocks.getSubscriberByUnsubscribeToken.mockRejectedValue(new Error('dynamo down'));

    expect((await get()).status).toBe(500);
  });

  it('escapes the page title it renders', async () => {
    const body = await (await get()).text();
    expect(body).toContain('<meta name="robots" content="noindex" />');
  });
});

describe('POST /api/unsubscribe', () => {
  it('unsubscribes the holder of the token', async () => {
    const res = await post();

    expect(res.status).toBe(200);
    expect(mocks.unsubscribe).toHaveBeenCalledWith(confirmed());
    expect(await res.text()).toContain('have been unsubscribed');
  });

  it('accepts the token from a form body when it is not in the query', async () => {
    await post('', 'token=tok-1');

    expect(mocks.getSubscriberByUnsubscribeToken).toHaveBeenCalledWith('tok-1');
    expect(mocks.unsubscribe).toHaveBeenCalled();
  });

  it('is idempotent for someone already unsubscribed', async () => {
    mocks.getSubscriberByUnsubscribeToken.mockResolvedValue(confirmed({ status: 'unsubscribed' }));

    const res = await post();

    expect(res.status).toBe(200);
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
  });

  it('404s for an unknown token', async () => {
    mocks.getSubscriberByUnsubscribeToken.mockResolvedValue(null);

    const res = await post();

    expect(res.status).toBe(404);
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
  });

  it('404s with no token at all', async () => {
    const res = await post('');

    expect(res.status).toBe(404);
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
  });

  it('reports a write failure as a 500', async () => {
    mocks.unsubscribe.mockRejectedValue(new Error('dynamo down'));

    expect((await post()).status).toBe(500);
  });
});
