import { ApiProperty } from '@nestjs/swagger';

export class TrackEvent {
  @ApiProperty()
  event: string;
  @ApiProperty()
  relay: number | null;
  @ApiProperty()
  distance: number;
}

export class Image {
  @ApiProperty()
  eventId: string;
  @ApiProperty()
  lastModified: Date;
  @ApiProperty()
  filename: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  timestamp: number;
  @ApiProperty()
  windSpeed: string | null;
  @ApiProperty({ type: () => TrackEvent })
  event: TrackEvent | null;
  @ApiProperty({ type: () => [Athlete] })
  athletes: Athlete[];
}

export class Athlete {
  @ApiProperty()
  rank: number;
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
  @ApiProperty()
  time: string;
  @ApiProperty()
  bib: number;
  @ApiProperty()
  lane: number;
  @ApiProperty()
  nationality: string | null;
  @ApiProperty()
  reactionTime: string | null;
}
