import { Contact } from './event';

export type RideGroupStatus = 'PUBLISHED' | 'DRAFT';

export const RIDE_PACES = [
  'Beginner friendly',
  'Intermediate',
  'Fast',
  'All paces welcome',
] as const;

export type RidePace = (typeof RIDE_PACES)[number];

export const RIDE_DISCIPLINES = ['MTB', 'Road', 'Gravel', 'Commute', 'Touring'] as const;

export interface RideGroupLinks {
  whatsapp?: string;
  strava?: string;
  instagram?: string;
  website?: string;
}

export interface RideGroup {
  id: string;
  name: string;
  district: string;
  description: string;
  disciplines: string[];
  /** Free text, e.g. "Saturdays & Sundays, 6:00 am". */
  schedule?: string;
  meetingPoint?: string;
  pace?: RidePace;
  links: RideGroupLinks;
  contact?: Contact;
  status: RideGroupStatus;
  audit: {
    createdAt: string;
    createdBy?: string;
    updatedAt: string;
    updatedBy?: string;
  };
}
