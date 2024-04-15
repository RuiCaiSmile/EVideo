import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import nms from './media';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useWebSocketAdapter(new WsAdapter(app));

  nms.run();

  await app.listen(8002);
}

bootstrap();
