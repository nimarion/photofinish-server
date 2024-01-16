import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EventsService } from './events.service';

@Injectable()
export class EventsMiddleware implements NestMiddleware {
  constructor(private readonly eventsService: EventsService) {}

  async use(request: Request, res: Response, next: NextFunction) {
    const eventId = request.params.event;
    const event = await this.eventsService.findOne(eventId);
    if (!event) {
      throw new NotFoundException();
    }
    next();
  }
}
