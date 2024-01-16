export class Image {
  eventId: string;
  filename: string;
  title: string;
  timestamp: number;
  windSpeed: string | null;
  event: Event | null;
  athletes: Athlete[];
}

export class Athlete {
  rank: number;
  firstname: string;
  lastname: string;
  time: string;
  bib: number;
  lane: number;
  nationality: string | null;
  reactionTime: string | null;
}

export class Event {
  event: string;
  relay: number | null;
  distance: number;
}
