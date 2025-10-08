import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(ApiGatewayModule);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription("Documentation de l'API")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Démarrage
  const port = Number(process.env.PORT) || 4000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API running on http://${host}:${port}`);
  console.log(`📚 Docs: http://${host}:${port}/api/docs`);
}

bootstrap();
