import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalModule } from './websocket/websocket.module';

@Module({
  imports: [SignalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
