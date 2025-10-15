import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IncomesModule } from './incomes.module';

async function bootstrap() {
  console.log('🔧 Starting Users Microservice...');
  console.log('Port:', 4007);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IncomesModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 4007,
      },
    },
  );

  await app.listen();
  console.log('✅ Users Microservice started on port 4007');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start users service:', error);
  process.exit(1);
});
