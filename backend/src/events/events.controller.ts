import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { Event } from './event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /*@Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }*/

  @Get()
  @ApiOkResponse({ type: Event, isArray: true })
  async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Event })
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.findOne(id);
    if (!event) {
      throw new NotFoundException();
    }
    return event;
  }

  /*@Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }*/
}
