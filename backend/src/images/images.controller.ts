import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { Image } from './image.entity';
@Controller('events/:event/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @ApiOkResponse({ type: Image, isArray: true })
  findAll(@Param('event') eventId: string) {
    return this.imagesService.findAll(eventId);
  }

  @Get(':filename')
  @ApiOkResponse({ type: Image })
  async findOne(
    @Param('event') eventId: string,
    @Param('filename') filename: string,
  ) {
    const image = await this.imagesService.findOne(eventId, filename);
    if (!image) {
      throw new NotFoundException();
    }
    return image;
  }
}
