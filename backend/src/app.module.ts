import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { EventsModule } from './events/events.module';
import { ImagesModule } from './images/images.module';
import { EventsMiddleware } from './events/events.middleware';
import { EventsService } from './events/events.service';
import { LiveModule } from './live/live.module';
import { createIPX, ipxFSStorage, createIPXNodeServer } from 'ipx';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    EventsModule,
    ImagesModule,
    LiveModule,
    EventEmitterModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
    }),
  ],
  controllers: [AppController],
  providers: [PrismaService, EventsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const ipx = createIPX({
      storage: ipxFSStorage({
        dir: './images',
      }),
    });
    consumer.apply(createIPXNodeServer(ipx)).forRoutes('/_ipx/');
    consumer.apply(EventsMiddleware).forRoutes('/events/:event');
  }
}
