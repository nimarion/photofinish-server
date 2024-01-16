import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class Event {
  @ApiProperty()
  @Expose()
  id: string;
  @ApiProperty()
  @Expose()
  @Type(() => Date)
  createdAt: Date;
  @ApiProperty()
  @Expose()
  @Type(() => Date)
  updatedAt: Date;
  @ApiProperty()
  @Expose()
  name: string;
  @ApiProperty()
  @Expose()
  @Type(() => Date)
  date: Date;

  constructor(event: Event) {
    Object.assign(this, event);
  }
}
