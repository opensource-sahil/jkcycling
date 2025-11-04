export interface Event {
  id: string;
  title: string;
  date: string;
  district: string;
  type: 'MTB' | 'Road';
  description: string;
  location: string;
  registrationUrl: string;
  notice: string;
  image: string;
}

export interface PastEvent extends Omit<Event, 'registrationUrl'> {
  results: {
    position: number;
    name: string;
    time: string;
  }[];
}

export interface EventsData {
  events: Event[];
}

export interface PastEventsData {
  events: PastEvent[];
}