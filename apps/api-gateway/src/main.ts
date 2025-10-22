import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApiGatewayModule } from './api-gateway.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(ApiGatewayModule, {});

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.enableCors();

    const config = new DocumentBuilder()
      .setTitle('API Gateway')
      .setDescription("Documentation de l'API")
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document);
    const port = Number(process.env.PORT) || 4000;
    await app.listen(port, '0.0.0.0');
  } catch (error) {
    console.log(error);
  }
}

bootstrap();
