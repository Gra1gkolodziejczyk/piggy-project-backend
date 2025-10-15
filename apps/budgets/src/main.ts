import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BudgetsModule } from './budgets.module';

async function bootstrap() {
  console.log('🔧 Starting Users Microservice...');
  console.log('Port:', 4004);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BudgetsModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 4004,
      },
    },
  );

  await app.listen();
  console.log('✅ Users Microservice started on port 4004');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start users service:', error);
  process.exit(1);
});
