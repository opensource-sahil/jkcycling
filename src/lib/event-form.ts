import {
  Contact,
  Event,
  EventStatus,
  EventType,
  RegistrationConfig,
  Result,
} from '@/types/event';

const PLACEHOLDER_IMAGE = '/images/events/placeholder.jpg';

/**
 * Only the slice of FormData we need. Keeps this module free of any
 * framework dependency so it can be unit tested directly.
 */
type FormLike = { get(key: string): FormDataEntryValue | null };

/** Trimmed string, or undefined for missing/blank values. */
function text(form: FormLike, key: string): string | undefined {
  return str(form.get(key));
}

function str(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Build a slug id of the form YYYY-MM-DD-event-name, dropping punctuation
 * so titles with brackets or trailing spaces don't leak into the id.
 */
export function slugifyEventId(date: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${date}-${slug}`;
}

function toResult(row: unknown): Result | null {
  if (typeof row !== 'object' || row === null) return null;
  const src = row as Record<string, unknown>;

  const position = Number(src.position);
  const name = str(src.name);
  if (!Number.isInteger(position) || position < 1 || !name) return null;

  const result: Result = {
    position,
    name,
    time: str(src.time) ?? '',
    category: str(src.category) ?? 'General',
  };

  const team = str(src.team);
  if (team) result.team = team;
  const bib = str(src.bib);
  if (bib) result.bib = bib;

  return result;
}

/**
 * Parse the JSON results payload submitted by the podium editor.
 *
 * Returns undefined when the field is absent or unusable, which callers read
 * as "leave whatever is already stored alone". An empty array is meaningful
 * and distinct: it means the admin cleared the podium.
 */
export function parseResults(raw: unknown): Result[] | undefined {
  if (typeof raw !== 'string') return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!Array.isArray(parsed)) return undefined;

  return parsed.flatMap((row) => {
    const result = toResult(row);
    return result ? [result] : [];
  });
}

function buildRegistration(form: FormLike): RegistrationConfig {
  const registration: RegistrationConfig = {
    isOpen: form.get('reg_isOpen') === 'on',
  };

  const url = text(form, 'reg_url');
  if (url) registration.url = url;
  const fee = text(form, 'reg_fee');
  if (fee) registration.fee = fee;
  const deadline = text(form, 'reg_deadline');
  if (deadline) registration.deadline = deadline;
  const instructions = text(form, 'reg_instructions');
  if (instructions) registration.instructions = instructions;

  return registration;
}

function buildOrganizer(form: FormLike): Event['organizer'] | undefined {
  const name = text(form, 'org_name');
  const contactName = text(form, 'org_contact_name');
  const phone = text(form, 'org_contact_phone');
  const email = text(form, 'org_contact_email');
  const role = text(form, 'org_contact_role');

  let contact: Contact | undefined;
  if (contactName || phone || email || role) {
    contact = { name: contactName ?? '' };
    if (phone) contact.phone = phone;
    if (email) contact.email = email;
    if (role) contact.role = role;
  }

  if (!name && !contact) return undefined;

  const organizer: NonNullable<Event['organizer']> = {};
  if (name) organizer.name = name;
  if (contact) organizer.contact = contact;
  return organizer;
}

/**
 * Turn an admin form submission into a complete Event, merged over the record
 * already in the database.
 *
 * Saving is a full Put, so every field the form does not carry has to be
 * copied forward here or it is destroyed. `results` and `notice` are the
 * dangerous ones: the form only submits them in some states, and losing a
 * published results table is not recoverable.
 */
export function buildEventFromForm(
  form: FormLike,
  existing?: Event | null,
  meta: { now?: string; actor?: string } = {},
): Event {
  const now = meta.now ?? new Date().toISOString();
  const actor = meta.actor;

  const title = text(form, 'title') ?? '';
  const date = text(form, 'date') ?? '';

  const event: Event = {
    id: text(form, 'id') ?? slugifyEventId(date, title),
    title,
    date,
    district: text(form, 'district') ?? '',
    type: (text(form, 'type') ?? 'MTB') as EventType,
    description: text(form, 'description') ?? '',
    location: text(form, 'location') ?? '',
    image: text(form, 'image') ?? PLACEHOLDER_IMAGE,
    categories: (text(form, 'categories') ?? '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    registration: buildRegistration(form),
    status: (text(form, 'status') ?? 'UPCOMING') as EventStatus,
    audit: {
      createdAt: existing?.audit?.createdAt ?? now,
      createdBy: existing?.audit?.createdBy ?? actor,
      updatedAt: now,
      updatedBy: actor,
    },
  };

  const organizer = buildOrganizer(form);
  if (organizer) event.organizer = organizer;

  // Absent field means "keep what's stored"; an empty value means "clear it".
  const notice = form.get('notice') !== null ? text(form, 'notice') : existing?.notice;
  if (notice) event.notice = notice;

  const submitted = parseResults(form.get('results'));
  const results = submitted ?? existing?.results;
  if (results && results.length > 0) event.results = results;

  // The form never carries this; losing it would re-arm the notify button and
  // let the same event be announced to subscribers twice.
  if (existing?.notifiedAt) event.notifiedAt = existing.notifiedAt;

  return event;
}
