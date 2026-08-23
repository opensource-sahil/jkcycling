import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Event } from '@/types/event';

const mocks = vi.hoisted(() => ({
  getEventById: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/services/eventService', () => ({
  eventService: {
    getEventById: mocks.getEventById,
    getPastEvents: vi.fn(async () => []),
  },
}));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('next/link', () => ({ default: () => null }));

const { default: ResultDetailPage } = await import('@/app/results/[id]/page');

function completed(overrides: Partial<Event> = {}): Event {
  return {
    id: '2026-05-01-srinagar-classic',
    title: 'Srinagar Classic',
    date: '2026-05-01',
    district: 'Srinagar',
    type: 'Road',
    description: 'A road race.',
    location: 'Dal Lake Circuit',
    image: '/images/events/srinagar.jpg',
    categories: ['Men Elite'],
    registration: { isOpen: false },
    status: 'COMPLETED',
    audit: { createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
    ...overrides,
  };
}

/** Gather every string in a returned element tree, so copy can be asserted. */
function collectText(node: unknown, out: string[] = []): string[] {
  if (typeof node === 'string') {
    out.push(node);
  } else if (Array.isArray(node)) {
    for (const child of node) collectText(child, out);
  } else if (node && typeof node === 'object') {
    const props = (node as { props?: Record<string, unknown> }).props;
    if (props) for (const value of Object.values(props)) collectText(value, out);
  }
  return out;
}

const render = (id = '2026-05-01-srinagar-classic') => ResultDetailPage({ params: { id } });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('results detail page', () => {
  it('renders a completed event whose placings are only in a PDF', async () => {
    mocks.getEventById.mockResolvedValue(completed({ notice: '/notices/results.pdf' }));

    const tree = await render();

    expect(mocks.notFound).not.toHaveBeenCalled();
    expect(collectText(tree).join(' ')).toContain('published in the results PDF');
  });

  it('renders a completed event with neither placings nor a PDF', async () => {
    mocks.getEventById.mockResolvedValue(completed());

    const tree = await render();

    expect(mocks.notFound).not.toHaveBeenCalled();
    expect(collectText(tree).join(' ')).toContain('have not been published yet');
  });

  it('renders structured placings when they exist', async () => {
    mocks.getEventById.mockResolvedValue(
      completed({
        results: [{ position: 1, name: 'Aamir Khan', time: '2:15:30', category: 'Men Elite' }],
      }),
    );

    const tree = await render();
    const text = collectText(tree).join(' ');

    expect(mocks.notFound).not.toHaveBeenCalled();
    expect(text).toContain('Aamir Khan');
    expect(text).not.toContain('have not been published yet');
  });

  it('404s for an event that is not completed', async () => {
    mocks.getEventById.mockResolvedValue(completed({ status: 'UPCOMING' }));

    await expect(render()).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.notFound).toHaveBeenCalled();
  });

  it('404s for an unknown event', async () => {
    mocks.getEventById.mockResolvedValue(null);

    await expect(render()).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
