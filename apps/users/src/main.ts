import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const host = process.env.USERS_HOST || '127.0.0.1';
  const port = Number(process.env.USERS_PORT);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.TCP,
      options: {
        host,
        port,
      },
    },
  );
  await app.listen();
}
bootstrap();
