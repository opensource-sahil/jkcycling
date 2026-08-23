import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RideGroup } from '@/types/ride-group';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getById: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/lib/auth-utils', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('@/services/rideGroupService', () => ({
  rideGroupService: {
    getById: mocks.getById,
    save: mocks.save,
    delete: mocks.remove,
  },
}));
vi.mock('next/cache', () => ({ revalidateTag: mocks.revalidateTag }));

const { saveRideGroupAction, deleteRideGroupAction } = await import('@/app/admin/groups/actions');

const stored: RideGroup = {
  id: 'srinagar-dawn-riders',
  name: 'Srinagar Dawn Riders',
  district: 'Srinagar',
  description: 'Early morning group rides.',
  disciplines: ['Road'],
  links: { strava: 'https://strava.com/clubs/jk' },
  status: 'PUBLISHED',
  audit: {
    createdAt: '2026-01-01T00:00:00.000Z',
    createdBy: 'founder@example.com',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
};

function form(fields: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set('id', stored.id);
  fd.set('name', stored.name);
  fd.set('district', stored.district);
  fd.set('description', stored.description);
  fd.set('disciplines', 'Road');
  fd.set('status', 'PUBLISHED');
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdmin.mockResolvedValue('admin@example.com');
  mocks.getById.mockResolvedValue(stored);
  mocks.save.mockResolvedValue(undefined);
  mocks.remove.mockResolvedValue(undefined);
});

describe('saveRideGroupAction', () => {
  it('saves and revalidates the directory', async () => {
    const res = await saveRideGroupAction(null, form());

    expect(res.success).toBe(true);
    expect(mocks.save).toHaveBeenCalled();
    expect(mocks.revalidateTag).toHaveBeenCalled();
  });

  it('loads the stored group so unsubmitted fields survive the Put', async () => {
    await saveRideGroupAction(null, form());

    expect(mocks.getById).toHaveBeenCalledWith(stored.id);
    const saved = mocks.save.mock.calls[0][0] as RideGroup;
    expect(saved.audit.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(saved.audit.updatedBy).toBe('admin@example.com');
  });

  it('does not look up a stored record for a new group', async () => {
    const fd = form();
    fd.delete('id');

    await saveRideGroupAction(null, fd);

    expect(mocks.getById).not.toHaveBeenCalled();
    expect((mocks.save.mock.calls[0][0] as RideGroup).id).toBe('srinagar-dawn-riders');
  });

  it('requires a name', async () => {
    const res = await saveRideGroupAction(null, form({ name: '' }));

    expect(res.success).toBe(false);
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('requires a district', async () => {
    const res = await saveRideGroupAction(null, form({ district: '' }));

    expect(res.success).toBe(false);
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('rejects a name that produces no usable id', async () => {
    const fd = form({ name: '!!!' });
    fd.delete('id');

    const res = await saveRideGroupAction(null, fd);

    expect(res.success).toBe(false);
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('drops an unsafe link rather than storing it', async () => {
    await saveRideGroupAction(null, form({ link_website: 'javascript:alert(1)' }));

    const saved = mocks.save.mock.calls[0][0] as RideGroup;
    expect(saved.links).not.toHaveProperty('website');
  });

  it('does not write when the caller is not an admin', async () => {
    mocks.requireAdmin.mockRejectedValue(new Error('Unauthorized Access'));

    const res = await saveRideGroupAction(null, form());

    expect(res).toEqual({ success: false, message: 'You are not authorized to do that.' });
    expect(mocks.save).not.toHaveBeenCalled();
  });
});

describe('deleteRideGroupAction', () => {
  it('deletes and revalidates', async () => {
    const res = await deleteRideGroupAction(stored.id);

    expect(res.success).toBe(true);
    expect(mocks.remove).toHaveBeenCalledWith(stored.id);
    expect(mocks.revalidateTag).toHaveBeenCalled();
  });

  it('refuses a blank id', async () => {
    const res = await deleteRideGroupAction('  ');

    expect(res.success).toBe(false);
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it('does not delete when the caller is not an admin', async () => {
    mocks.requireAdmin.mockRejectedValue(new Error('Unauthorized Access'));

    const res = await deleteRideGroupAction(stored.id);

    expect(res.success).toBe(false);
    expect(mocks.remove).not.toHaveBeenCalled();
  });
});
