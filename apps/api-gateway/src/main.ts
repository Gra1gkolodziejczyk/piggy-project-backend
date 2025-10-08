import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiGatewayModule } from './api-gateway.module';

// Logs AVANT le bootstrap pour voir si le fichier est bien exécuté
console.log('========================================');
console.log('🚀 STARTING API GATEWAY');
console.log('========================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('Current directory:', process.cwd());
console.log('========================================');

async function bootstrap() {
  try {
    console.log('[1/6] Bootstrap starting...');

    console.log('[2/6] Creating NestJS application...');
    const app = await NestFactory.create(ApiGatewayModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    console.log('[3/6] Setting up global pipes...');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    console.log('[4/6] Enabling CORS...');
    app.enableCors();

    console.log('[5/6] Setting up Swagger...');
    const config = new DocumentBuilder()
      .setTitle('API Gateway')
      .setDescription("Documentation de l'API")
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    console.log('[6/6] Starting HTTP server...');
    const port = Number(process.env.PORT) || 4000;
    console.log('Port to use:', port);

    await app.listen(port, '0.0.0.0');

    console.log('========================================');
    console.log('✅ APPLICATION STARTED SUCCESSFULLY');
    console.log(`🚀 Server running on: http://0.0.0.0:${port}`);
    console.log(`📚 API Docs: http://0.0.0.0:${port}/api/docs`);
    console.log('========================================');
  } catch (error) {
    console.error('========================================');
    console.error('❌ FATAL ERROR DURING BOOTSTRAP');
    console.error('========================================');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('========================================');
    process.exit(1);
  }
}

// Catch des erreurs non gérées
process.on('uncaughtException', (error) => {
  console.error('========================================');
  console.error('❌ UNCAUGHT EXCEPTION');
  console.error('========================================');
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('========================================');
  console.error('❌ UNHANDLED REJECTION');
  console.error('========================================');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

bootstrap();
