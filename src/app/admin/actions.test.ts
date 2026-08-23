import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Event } from '@/types/event';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getEventById: vi.fn(),
  saveEvent: vi.fn(),
  deleteEvent: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/auth-utils', () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock('@/services/eventService', () => ({
  eventService: {
    getEventById: mocks.getEventById,
    saveEvent: mocks.saveEvent,
    deleteEvent: mocks.deleteEvent,
  },
}));

vi.mock('next/cache', () => ({
  revalidateTag: mocks.revalidateTag,
}));

const { saveEventAction, deleteEventAction } = await import('@/app/admin/actions');

const stored: Event = {
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
  notice: '/notices/srinagar-results.pdf',
  results: [{ position: 1, name: 'Aamir Khan', time: '2:15:30', category: 'Men Elite' }],
  audit: { createdAt: '2026-01-01T00:00:00.000Z', createdBy: 'organiser@example.com', updatedAt: '2026-02-01T00:00:00.000Z' },
};

/** An edit submission that carries no results field, as the form does for a non-completed status. */
function editForm(fields: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set('id', stored.id);
  fd.set('title', stored.title);
  fd.set('date', stored.date);
  fd.set('district', stored.district);
  fd.set('type', stored.type);
  fd.set('description', stored.description);
  fd.set('location', stored.location);
  fd.set('status', stored.status);
  fd.set('categories', 'Men Elite');
  fd.set('image', stored.image);
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue('admin@example.com');
  mocks.getEventById.mockResolvedValue(stored);
  mocks.saveEvent.mockResolvedValue(undefined);
  mocks.deleteEvent.mockResolvedValue(undefined);
});

describe('saveEventAction', () => {
  it('loads the stored event so unsubmitted fields survive the Put', async () => {
    const res = await saveEventAction(null, editForm());

    expect(res.success).toBe(true);
    expect(mocks.getEventById).toHaveBeenCalledWith(stored.id);

    const saved = mocks.saveEvent.mock.calls[0][0] as Event;
    expect(saved.results).toEqual(stored.results);
    expect(saved.audit.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('stamps the acting admin on the audit trail', async () => {
    await saveEventAction(null, editForm());

    const saved = mocks.saveEvent.mock.calls[0][0] as Event;
    expect(saved.audit.updatedBy).toBe('admin@example.com');
  });

  it('revalidates the events cache so the change is visible before the hour is up', async () => {
    await saveEventAction(null, editForm());
    expect(mocks.revalidateTag).toHaveBeenCalled();
  });

  it('does not look up a stored record for a new event', async () => {
    const fd = editForm();
    fd.delete('id');

    await saveEventAction(null, fd);

    expect(mocks.getEventById).not.toHaveBeenCalled();
    expect(mocks.saveEvent).toHaveBeenCalled();
  });

  it('rejects a submission missing required fields without writing', async () => {
    const fd = editForm();
    fd.set('title', '');

    const res = await saveEventAction(null, fd);

    expect(res.success).toBe(false);
    expect(mocks.saveEvent).not.toHaveBeenCalled();
  });

  it('does not write when the caller is not an admin', async () => {
    mocks.requireAdmin.mockRejectedValue(new Error('Unauthorized Access'));

    const res = await saveEventAction(null, editForm());

    expect(res).toEqual({ success: false, message: 'You are not authorized to do that.' });
    expect(mocks.saveEvent).not.toHaveBeenCalled();
  });
});

describe('deleteEventAction', () => {
  it('deletes and revalidates', async () => {
    const res = await deleteEventAction(stored.id);

    expect(res.success).toBe(true);
    expect(mocks.deleteEvent).toHaveBeenCalledWith(stored.id);
    expect(mocks.revalidateTag).toHaveBeenCalled();
  });

  it('refuses a blank id', async () => {
    const res = await deleteEventAction('   ');

    expect(res.success).toBe(false);
    expect(mocks.deleteEvent).not.toHaveBeenCalled();
  });

  it('does not delete when the caller is not an admin', async () => {
    mocks.requireAdmin.mockRejectedValue(new Error('Unauthorized Access'));

    const res = await deleteEventAction(stored.id);

    expect(res.success).toBe(false);
    expect(mocks.deleteEvent).not.toHaveBeenCalled();
  });
});
