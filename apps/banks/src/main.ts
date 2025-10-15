import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BanksModule } from './banks.module';

async function bootstrap() {
  console.log('🔧 Starting Users Microservice...');
  console.log('Port:', 4003);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BanksModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 4003,
      },
    },
  );

  await app.listen();
  console.log('✅ Users Microservice started on port 4003');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start users service:', error);
  process.exit(1);
});
