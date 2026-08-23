export type EventStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'DRAFT';
export type EventType = 'MTB' | 'Road' | 'Cyclocross' | 'Downhill' | 'BMX' | 'Enduro';

export const JK_DISTRICTS = [
  'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 
  'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 
  'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 
  'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'
];

export const RACE_CATEGORIES = [
  'Men Elite', 'Women Elite', 
  'Under-14', 'Under-16', 'Under-18', 'Under-23',
  'Masters (35+)', 'Grand Masters (45+)', 'Veterans (55+)',
  'Amateur (Open)', 'Kids (Under-10)'
];

export interface Result {
  position: number;
  name: string;
  time: string;
  category: string;
  team?: string;
  bib?: string;
}

export interface Contact {
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}

export interface RegistrationConfig {
  url?: string;
  deadline?: string;
  fee?: string;
  isOpen: boolean;
  instructions?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  district: string;
  type: EventType;
  description: string;
  location: string;
  image: string;
  categories: string[];
  registration: RegistrationConfig;
  organizer?: {
    name?: string;
    contact?: Contact;
  };
  notice?: string;
  status: EventStatus;
  /** Set once subscribers have been emailed about this event. */
  notifiedAt?: string;
  audit: {
    createdAt: string;
    createdBy?: string;
    updatedAt: string;
    updatedBy?: string;
  };
  results?: Result[];
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  district: string;
  status: 'confirmed' | 'pending' | 'unsubscribed';
  /** Single-use double-opt-in token, removed once the address is confirmed. */
  token?: string;
  /** Long-lived token backing the unsubscribe link in every bulk email. */
  unsubscribeToken?: string;
  createdAt: string;
  confirmedAt?: string;
  preferences?: Record<string, boolean>;
  lastNotifiedAt?: string;
}