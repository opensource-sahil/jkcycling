import { describe, expect, it } from 'vitest';
import { RideGroup } from '@/types/ride-group';
import { buildRideGroupFromForm, safeUrl, slugifyGroupId } from '@/lib/ride-group-form';

const NOW = '2026-08-23T12:00:00.000Z';
const META = { now: NOW, actor: 'admin@example.com' };

function form(fields: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set('name', 'Srinagar Dawn Riders');
  fd.set('district', 'Srinagar');
  fd.set('description', 'Early morning group rides around the lake.');
  fd.set('disciplines', 'Road, MTB');
  fd.set('status', 'PUBLISHED');
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

function existing(overrides: Partial<RideGroup> = {}): RideGroup {
  return {
    id: 'srinagar-dawn-riders',
    name: 'Srinagar Dawn Riders',
    district: 'Srinagar',
    description: 'Early morning group rides.',
    disciplines: ['Road'],
    links: {},
    status: 'PUBLISHED',
    audit: {
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: 'founder@example.com',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
    ...overrides,
  };
}

describe('slugifyGroupId', () => {
  it('slugifies a name', () => {
    expect(slugifyGroupId('Srinagar Dawn Riders')).toBe('srinagar-dawn-riders');
  });

  it('strips punctuation and trailing separators', () => {
    expect(slugifyGroupId('Gulmarg MTB Crew!! ')).toBe('gulmarg-mtb-crew');
  });
});

describe('safeUrl', () => {
  it('accepts https', () => {
    expect(safeUrl('https://strava.com/clubs/jk')).toBe('https://strava.com/clubs/jk');
  });

  it('accepts http', () => {
    expect(safeUrl('http://example.com/')).toBe('http://example.com/');
  });

  it('upgrades a bare domain to https', () => {
    expect(safeUrl('chat.whatsapp.com/ABC123')).toBe('https://chat.whatsapp.com/ABC123');
  });

  // These render straight into an href, so anything executable must be dropped.
  it('rejects javascript: urls', () => {
    expect(safeUrl('javascript:alert(1)')).toBeUndefined();
  });

  it('rejects javascript: regardless of case', () => {
    expect(safeUrl('JavaScript:alert(1)')).toBeUndefined();
  });

  it('rejects data: urls', () => {
    expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('rejects mailto and tel, which belong in the contact fields', () => {
    expect(safeUrl('mailto:a@b.com')).toBeUndefined();
    expect(safeUrl('tel:+911234567890')).toBeUndefined();
  });

  it('returns undefined for blank input', () => {
    expect(safeUrl('   ')).toBeUndefined();
    expect(safeUrl(null)).toBeUndefined();
  });

  it('returns undefined for something unparseable', () => {
    expect(safeUrl('http://')).toBeUndefined();
  });
});

describe('buildRideGroupFromForm', () => {
  it('builds a group and slugifies a new id', () => {
    const group = buildRideGroupFromForm(form(), null, META);

    expect(group.id).toBe('srinagar-dawn-riders');
    expect(group.name).toBe('Srinagar Dawn Riders');
    expect(group.disciplines).toEqual(['Road', 'MTB']);
    expect(group.status).toBe('PUBLISHED');
  });

  it('keeps a submitted id when editing', () => {
    const group = buildRideGroupFromForm(form({ id: 'existing-id' }), existing(), META);
    expect(group.id).toBe('existing-id');
  });

  it('carries forward createdAt and createdBy', () => {
    const group = buildRideGroupFromForm(form(), existing(), META);

    expect(group.audit).toEqual({
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: 'founder@example.com',
      updatedAt: NOW,
      updatedBy: 'admin@example.com',
    });
  });

  it('defaults to DRAFT so a half-filled group is not published by accident', () => {
    const fd = form();
    fd.delete('status');
    expect(buildRideGroupFromForm(fd, null, META).status).toBe('DRAFT');
  });

  it('keeps only safe links', () => {
    const group = buildRideGroupFromForm(
      form({
        link_whatsapp: 'chat.whatsapp.com/ABC',
        link_strava: 'javascript:alert(1)',
        link_instagram: '',
        link_website: 'https://jkcycling.com',
      }),
      null,
      META,
    );

    expect(group.links.whatsapp).toBe('https://chat.whatsapp.com/ABC');
    expect(group.links).not.toHaveProperty('strava');
    expect(group.links).not.toHaveProperty('instagram');
    expect(group.links.website).toBe('https://jkcycling.com/');
  });

  it('omits the contact block when no contact fields are given', () => {
    expect(buildRideGroupFromForm(form(), null, META).contact).toBeUndefined();
  });

  it('builds a contact from any single field', () => {
    const group = buildRideGroupFromForm(form({ contact_phone: '+91 99999 99999' }), null, META);
    expect(group.contact).toEqual({ name: '', phone: '+91 99999 99999' });
  });

  it('ignores a pace that is not one of the known values', () => {
    expect(buildRideGroupFromForm(form({ pace: 'Blistering' }), null, META).pace).toBeUndefined();
  });

  it('accepts a known pace', () => {
    expect(buildRideGroupFromForm(form({ pace: 'Intermediate' }), null, META).pace).toBe('Intermediate');
  });

  it('omits blank optional fields rather than storing empty strings', () => {
    const group = buildRideGroupFromForm(form({ schedule: '  ', meetingPoint: '' }), null, META);
    expect(group).not.toHaveProperty('schedule');
    expect(group).not.toHaveProperty('meetingPoint');
  });
});
