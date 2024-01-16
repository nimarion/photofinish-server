import { Module } from '@nestjs/common';
import { LiveGateway } from './live.gateway';

@Module({
  providers: [LiveGateway],
})
export class LiveModule {}
