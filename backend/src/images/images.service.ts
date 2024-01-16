import { Injectable } from '@nestjs/common';
import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs';
import { Image } from './image.entity';
import { parseIptcFromFile } from './iptc.parser';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ImageCreatedEvent } from './events/image-created.event';
import { ImageDeletedEvent } from './events/image-deleted.event';
import { ImageUpdatedEvent } from './events/image-updated.event';

const baseFolder = 'images';

@Injectable()
export class ImagesService {
  constructor(private eventEmitter: EventEmitter2) {
    this.fileWatcher();
  }

  fileWatcher() {
    chokidar
      .watch(`${baseFolder}/*/*.{jpeg,jpg}`, { ignoreInitial: true })
      .on('all', async (fileevent, filepath) => {
        if (filepath.endsWith('.jpg') || filepath.endsWith('.jpeg')) {
          const folders = filepath.split(path.sep);
          if (folders.length != 3) return;
          const eventId = folders[folders.length - 2];
          const imageFile = folders[folders.length - 1];
          switch (fileevent) {
            case 'add':
              const image = await this.findOne(eventId, imageFile);
              const imageCreatedEvent: ImageCreatedEvent = {
                image,
              };
              this.eventEmitter.emit('image.created', imageCreatedEvent);
              break;
            case 'change':
              const imageUpdatedEvent: ImageUpdatedEvent = {
                image,
              };
              this.eventEmitter.emit('image.updated', imageUpdatedEvent);
              break;
            case 'unlink':
              const imageDeletedEvent: ImageDeletedEvent = {
                eventId,
                filename: imageFile,
              };
              this.eventEmitter.emit('image.deleted', imageDeletedEvent);
              break;
            default:
              console.log(fileevent, eventId, imageFile);
          }
        }
      });
  }

  async findAll(eventId: string) {
    const files = fs
      .readdirSync(path.join(baseFolder, eventId))
      .filter((file) => {
        return file.endsWith('.jpg') || file.endsWith('.jpeg');
      })
      .filter((file) => {
        return file != 'thumbnail.jpg';
      });

    const images = (
      await Promise.all(
        files.map(async (file) => {
          return this.findOne(eventId, file);
        }),
      )
    )
      .filter((image) => image != null)
      .sort((a, b) => {
        if (a == null || b == null) return 0;
        if (a.timestamp === 0 && b.timestamp === 0) {
          return 0;
        } else if (a.timestamp === 0) {
          return 1;
        } else if (b.timestamp === 0) {
          return -1;
        } else {
          return a.timestamp > b.timestamp
            ? 1
            : b.timestamp > a.timestamp
              ? -1
              : 0;
        }
      }) as Image[];
    return images;
  }

  async findOne(eventId: string, filename: string) {
    if (fs.existsSync(baseFolder + '/' + eventId + '/' + filename) == false) {
      return null;
    }
    try {
      return await parseIptcFromFile(
        baseFolder + '/' + eventId + '/' + filename,
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
