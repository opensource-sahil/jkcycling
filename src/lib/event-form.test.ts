import { describe, expect, it } from 'vitest';
import { Event, Result } from '@/types/event';
import { buildEventFromForm, parseResults, slugifyEventId } from '@/lib/event-form';

const NOW = '2026-08-23T12:00:00.000Z';
const META = { now: NOW, actor: 'admin@example.com' };

/** A completed event already in the database, with results worth protecting. */
function existingCompleted(overrides: Partial<Event> = {}): Event {
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
    notice: '/notices/srinagar-results.pdf',
    results: [{ position: 1, name: 'Aamir Khan', time: '2:15:30', category: 'Men Elite' }],
    audit: {
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: 'organiser@example.com',
      updatedAt: '2026-02-01T00:00:00.000Z',
    },
    ...overrides,
  };
}

/** The minimum fields EventForm always submits. */
function form(fields: Record<string, string> = {}) {
  const fd = new FormData();
  fd.set('title', 'Srinagar Classic');
  fd.set('date', '2026-05-01');
  fd.set('district', 'Srinagar');
  fd.set('type', 'Road');
  fd.set('description', 'A road race.');
  fd.set('location', 'Dal Lake Circuit');
  fd.set('status', 'COMPLETED');
  fd.set('categories', 'Men Elite');
  fd.set('image', '/images/events/srinagar.jpg');
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe('slugifyEventId', () => {
  it('builds a YYYY-MM-DD-title slug', () => {
    expect(slugifyEventId('2025-12-15', 'MTB Jammu Winter Challenge')).toBe(
      '2025-12-15-mtb-jammu-winter-challenge',
    );
  });

  it('strips punctuation rather than leaving it in the id', () => {
    expect(slugifyEventId('2025-12-15', "Gulmarg Downhill (Round #2)!")).toBe(
      '2025-12-15-gulmarg-downhill-round-2',
    );
  });

  it('does not leave a trailing dash for titles with trailing spaces', () => {
    expect(slugifyEventId('2026-03-25', 'Testing Multiple Event ')).toBe(
      '2026-03-25-testing-multiple-event',
    );
  });
});

describe('parseResults', () => {
  it('returns undefined when the field is absent, so callers can preserve existing results', () => {
    expect(parseResults(null)).toBeUndefined();
  });

  it('returns undefined for malformed JSON', () => {
    expect(parseResults('not json')).toBeUndefined();
  });

  it('returns undefined when the payload is not an array', () => {
    expect(parseResults('{"position":1}')).toBeUndefined();
  });

  it('returns an empty array for an explicit empty payload, meaning "clear"', () => {
    expect(parseResults('[]')).toEqual([]);
  });

  it('parses rows, trimming and defaulting the category', () => {
    const raw = JSON.stringify([
      { position: '1', name: '  Aamir Khan  ', time: ' 2:15:30 ', category: ' Men Elite ' },
      { position: 2, name: 'Bilal Ahmed', time: '2:16:02' },
    ]);
    expect(parseResults(raw)).toEqual<Result[]>([
      { position: 1, name: 'Aamir Khan', time: '2:15:30', category: 'Men Elite' },
      { position: 2, name: 'Bilal Ahmed', time: '2:16:02', category: 'General' },
    ]);
  });

  it('drops rows with no name or an unusable position', () => {
    const raw = JSON.stringify([
      { position: 1, name: '', time: '2:15:30' },
      { position: 0, name: 'Zero Position', time: '2:15:30' },
      { position: 'abc', name: 'Bad Position', time: '2:15:30' },
      { position: 1, name: 'Valid Rider', time: '2:15:30' },
    ]);
    expect(parseResults(raw)).toEqual<Result[]>([
      { position: 1, name: 'Valid Rider', time: '2:15:30', category: 'General' },
    ]);
  });

  it('omits blank optional fields instead of storing empty strings', () => {
    const raw = JSON.stringify([
      { position: 1, name: 'Aamir Khan', time: '2:15:30', category: 'Men Elite', team: '  ', bib: '' },
    ]);
    const parsed = parseResults(raw)!;
    expect(parsed[0]).not.toHaveProperty('team');
    expect(parsed[0]).not.toHaveProperty('bib');
  });

  it('keeps optional fields when they carry a value', () => {
    const raw = JSON.stringify([
      { position: 1, name: 'Aamir Khan', time: '2:15:30', category: 'Men Elite', team: 'JK Racing', bib: '42' },
    ]);
    expect(parseResults(raw)![0]).toMatchObject({ team: 'JK Racing', bib: '42' });
  });
});

describe('buildEventFromForm — results preservation', () => {
  it('preserves existing results when the form submits no results field', () => {
    const existing = existingCompleted();
    const built = buildEventFromForm(form(), existing, META);
    expect(built.results).toEqual(existing.results);
  });

  it('replaces results when the form submits rows', () => {
    const built = buildEventFromForm(
      form({
        results: JSON.stringify([
          { position: 1, name: 'Zoya Mir', time: '2:31:10', category: 'Women Elite' },
        ]),
      }),
      existingCompleted(),
      META,
    );
    expect(built.results).toEqual<Result[]>([
      { position: 1, name: 'Zoya Mir', time: '2:31:10', category: 'Women Elite' },
    ]);
  });

  it('clears results when the form submits an explicitly empty list', () => {
    const built = buildEventFromForm(form({ results: '[]' }), existingCompleted(), META);
    expect(built.results).toBeUndefined();
  });

  it('leaves results undefined for a brand new event', () => {
    expect(buildEventFromForm(form(), null, META).results).toBeUndefined();
  });
});

describe('buildEventFromForm — notifiedAt preservation', () => {
  it('carries forward notifiedAt so an edit cannot re-arm the notify button', () => {
    const existing = existingCompleted({ notifiedAt: '2026-04-01T09:00:00.000Z' });
    const built = buildEventFromForm(form(), existing, META);
    expect(built.notifiedAt).toBe('2026-04-01T09:00:00.000Z');
  });

  it('leaves notifiedAt unset for an event that has never been announced', () => {
    expect(buildEventFromForm(form(), existingCompleted(), META).notifiedAt).toBeUndefined();
  });
});

describe('buildEventFromForm — notice preservation', () => {
  it('preserves the existing notice when the form omits the field', () => {
    const built = buildEventFromForm(form(), existingCompleted(), META);
    expect(built.notice).toBe('/notices/srinagar-results.pdf');
  });

  it('clears the notice when the form submits an empty value', () => {
    const built = buildEventFromForm(form({ notice: '' }), existingCompleted(), META);
    expect(built.notice).toBeUndefined();
  });

  it('trims a submitted notice url', () => {
    const built = buildEventFromForm(form({ notice: '  /notices/new.pdf  ' }), existingCompleted(), META);
    expect(built.notice).toBe('/notices/new.pdf');
  });
});

describe('buildEventFromForm — identity and audit', () => {
  it('keeps the submitted id when editing', () => {
    const built = buildEventFromForm(form({ id: '2026-05-01-srinagar-classic' }), existingCompleted(), META);
    expect(built.id).toBe('2026-05-01-srinagar-classic');
  });

  it('generates a slug id for a new event', () => {
    const built = buildEventFromForm(form({ title: 'Gulmarg Enduro', date: '2026-06-10' }), null, META);
    expect(built.id).toBe('2026-06-10-gulmarg-enduro');
  });

  it('carries forward createdAt and createdBy, and stamps the current actor', () => {
    const built = buildEventFromForm(form(), existingCompleted(), META);
    expect(built.audit).toEqual({
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: 'organiser@example.com',
      updatedAt: NOW,
      updatedBy: 'admin@example.com',
    });
  });

  it('stamps the actor as creator for a new event', () => {
    const built = buildEventFromForm(form(), null, META);
    expect(built.audit).toEqual({
      createdAt: NOW,
      createdBy: 'admin@example.com',
      updatedAt: NOW,
      updatedBy: 'admin@example.com',
    });
  });
});

describe('buildEventFromForm — field normalisation', () => {
  it('splits categories and drops blanks', () => {
    const built = buildEventFromForm(form({ categories: 'Men Elite, Women Elite , ,Under-18' }), null, META);
    expect(built.categories).toEqual(['Men Elite', 'Women Elite', 'Under-18']);
  });

  it('falls back to the placeholder image', () => {
    const built = buildEventFromForm(form({ image: '' }), null, META);
    expect(built.image).toBe('/images/events/placeholder.jpg');
  });

  it('reads the registration checkbox', () => {
    expect(buildEventFromForm(form({ reg_isOpen: 'on' }), null, META).registration.isOpen).toBe(true);
    expect(buildEventFromForm(form(), null, META).registration.isOpen).toBe(false);
  });

  it('omits blank registration fields rather than storing empty strings', () => {
    const built = buildEventFromForm(form({ reg_url: '', reg_fee: '  ' }), null, META);
    expect(built.registration).not.toHaveProperty('url');
    expect(built.registration).not.toHaveProperty('fee');
  });

  it('omits the organizer contact entirely when no contact fields are given', () => {
    const built = buildEventFromForm(form({ org_name: 'JK Cycling Association' }), null, META);
    expect(built.organizer).toEqual({ name: 'JK Cycling Association' });
  });

  it('omits the organizer entirely when nothing is given', () => {
    expect(buildEventFromForm(form(), null, META).organizer).toBeUndefined();
  });
});
