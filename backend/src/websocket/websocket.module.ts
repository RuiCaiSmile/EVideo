import { Module } from '@nestjs/common';
import { SignalGateway } from './websocket.gateway';

@Module({
  providers: [SignalGateway],
})
export class SignalModule {}
