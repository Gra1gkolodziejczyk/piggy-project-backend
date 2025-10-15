import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ExpensesModule } from './expenses.module';

async function bootstrap() {
  console.log('🔧 Starting Users Microservice...');
  console.log('Port:', 4005);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ExpensesModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 4005,
      },
    },
  );

  await app.listen();
  console.log('✅ Users Microservice started on port 4005');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start users service:', error);
  process.exit(1);
});
