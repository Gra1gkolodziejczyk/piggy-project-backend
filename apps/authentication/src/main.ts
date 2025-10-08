import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthenticationModule } from './authentication.module';

async function bootstrap() {
  console.log('🔧 Starting Authentication Microservice...');
  console.log('Port:', 4001);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthenticationModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: 4001,
      },
    },
  );

  await app.listen();
  console.log('✅ Authentication Microservice started on port 4001');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start authentication service:', error);
  process.exit(1);
});
