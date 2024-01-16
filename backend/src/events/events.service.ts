import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Event } from './event.entity';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.event
      .findMany()
      .then((events) => events.map((event) => new Event(event)));
  }

  findOne(id: string) {
    return this.prisma.event
      .findUnique({
        where: {
          id,
        },
      })
      .then((event) => (event ? new Event(event) : null));
  }
}
