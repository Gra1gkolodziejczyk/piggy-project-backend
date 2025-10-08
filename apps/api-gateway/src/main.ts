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
  app.enableCors();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription("Documentation de l'API")
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // CRITIQUE : Railway utilise PORT, pas API_GATEWAY_PORT
  const port = Number(process.env.PORT) || 4000;

  // CRITIQUE : Toujours écouter sur 0.0.0.0
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API running on port ${port}`);
  console.log(`📚 Docs available at /api/docs`);
}

bootstrap();
