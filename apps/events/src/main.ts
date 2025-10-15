import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { EventsModule } from './events.module';

async function bootstrap() {
  console.log('🔧 Starting Users Microservice...');
  console.log('Port:', 4006);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EventsModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 4006,
      },
    },
  );

  await app.listen();
  console.log('✅ Users Microservice started on port 4006');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start users service:', error);
  process.exit(1);
});
