export interface Athlete {
  rank: number;
  firstname: string;
  lastname: string;
  time: string;
  bib: number;
  lane: number;
  nationality: string | null;
  reactionTime: string | null;
}

export interface Event {
  event: string;
  relay: number | null;
  distance: number;
}

export interface Image {
  competition: string;
  filename: string;
  title: string;
  timestamp: number;
  windSpeed: string | null;
  athletes: Athlete[];
  event: Event | null;
}
