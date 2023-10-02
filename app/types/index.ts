export interface Athlete {
  rank: number;
  firstname: string;
  lastname: string;
  time: string;
  reactionTime: string | null;
}

export interface Image {
    filename: string;
    title: string;
    timestamp: number;
    windSpeed: string | null;
    athletes: Athlete[];
}