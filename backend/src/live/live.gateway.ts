import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { ImageCreatedEvent } from 'src/images/events/image-created.event';
import { ImageDeletedEvent } from 'src/images/events/image-deleted.event';
import { ImageUpdatedEvent } from 'src/images/events/image-updated.event';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LiveGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    client.on('disconnecting', () => {
      client.rooms.forEach((room) => {
        const socketIoRoom = this.server.sockets.adapter.rooms.get(room);
        if (socketIoRoom) {
          this.server.to(room).emit('watchers', socketIoRoom.size - 1);
        }
      });
    });
  }

  @SubscribeMessage('joinEvent')
  joinEvent(client: Socket, eventId: string) {
    client.join(eventId);
    const socketIoRoom = this.server.sockets.adapter.rooms.get(eventId);
    if (socketIoRoom) {
      this.server.to(eventId).emit('watchers', socketIoRoom.size);
    }
  }

  @SubscribeMessage('leaveEvent')
  leaveEvent(client: Socket, eventId: string) {
    client.leave(eventId);
    const socketIoRoom = this.server.sockets.adapter.rooms.get(eventId);
    if (socketIoRoom) {
      this.server.to(eventId).emit('watchers', socketIoRoom.size);
    }
  }

  @OnEvent('image.created', { async: true })
  async handleImageCreatedEvent({ image }: ImageCreatedEvent) {
    this.server.to(image.eventId).emit('image.created', image);
  }

  @OnEvent('image.deleted', { async: true })
  async handleImageDeletedEvent({ eventId, filename }: ImageDeletedEvent) {
    this.server.to(eventId).emit('image.deleted', {
      eventId,
      filename,
    });
  }

  @OnEvent('image.updated', { async: true })
  async handleImageUpdatedEvent({ image }: ImageUpdatedEvent) {
    this.server.to(image.eventId).emit('image.updated', image);
  }
}
