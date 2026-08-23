import { Contact } from '@/types/event';
import {
  RIDE_PACES,
  RideGroup,
  RideGroupLinks,
  RideGroupStatus,
  RidePace,
} from '@/types/ride-group';

type FormLike = { get(key: string): FormDataEntryValue | null };

function str(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function text(form: FormLike, key: string): string | undefined {
  return str(form.get(key));
}

export function slugifyGroupId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Accept only links we are willing to render as an href.
 *
 * These values are typed by an admin and rendered straight into `href`, so a
 * `javascript:` or `data:` URL would execute in a visitor's browser. Anything
 * that is not http(s) is rejected; a bare domain is upgraded to https.
 */
export function safeUrl(input: unknown): string | undefined {
  const raw = str(input);
  if (!raw) return undefined;

  const candidate = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) ? raw : `https://${raw}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return undefined;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
  if (!parsed.hostname) return undefined;

  return parsed.toString();
}

function buildLinks(form: FormLike): RideGroupLinks {
  const links: RideGroupLinks = {};

  const whatsapp = safeUrl(form.get('link_whatsapp'));
  if (whatsapp) links.whatsapp = whatsapp;
  const strava = safeUrl(form.get('link_strava'));
  if (strava) links.strava = strava;
  const instagram = safeUrl(form.get('link_instagram'));
  if (instagram) links.instagram = instagram;
  const website = safeUrl(form.get('link_website'));
  if (website) links.website = website;

  return links;
}

function buildContact(form: FormLike): Contact | undefined {
  const name = text(form, 'contact_name');
  const phone = text(form, 'contact_phone');
  const email = text(form, 'contact_email');

  if (!name && !phone && !email) return undefined;

  const contact: Contact = { name: name ?? '' };
  if (phone) contact.phone = phone;
  if (email) contact.email = email;
  return contact;
}

function parsePace(value: string | undefined): RidePace | undefined {
  if (!value) return undefined;
  return (RIDE_PACES as readonly string[]).includes(value) ? (value as RidePace) : undefined;
}

/**
 * Turn an admin submission into a complete RideGroup, merged over the stored
 * record. Saving is a full Put, so anything the form does not submit has to be
 * carried forward here.
 */
export function buildRideGroupFromForm(
  form: FormLike,
  existing?: RideGroup | null,
  meta: { now?: string; actor?: string } = {},
): RideGroup {
  const now = meta.now ?? new Date().toISOString();
  const actor = meta.actor;

  const name = text(form, 'name') ?? '';

  const group: RideGroup = {
    id: text(form, 'id') ?? slugifyGroupId(name),
    name,
    district: text(form, 'district') ?? '',
    description: text(form, 'description') ?? '',
    disciplines: (text(form, 'disciplines') ?? '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean),
    links: buildLinks(form),
    status: (text(form, 'status') ?? 'DRAFT') as RideGroupStatus,
    audit: {
      createdAt: existing?.audit?.createdAt ?? now,
      createdBy: existing?.audit?.createdBy ?? actor,
      updatedAt: now,
      updatedBy: actor,
    },
  };

  const schedule = text(form, 'schedule');
  if (schedule) group.schedule = schedule;
  const meetingPoint = text(form, 'meetingPoint');
  if (meetingPoint) group.meetingPoint = meetingPoint;
  const pace = parsePace(text(form, 'pace'));
  if (pace) group.pace = pace;

  const contact = buildContact(form);
  if (contact) group.contact = contact;

  return group;
}
