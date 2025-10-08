async function bootstrap() {
  try {
    console.log('🔧 [1/5] Starting bootstrap...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port from env:', process.env.PORT);

    console.log('🔧 [2/5] Creating NestJS app...');
    const app = await NestFactory.create(ApiGatewayModule);

    console.log('🔧 [3/5] Setting up pipes and CORS...');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.enableCors();

    console.log('🔧 [4/5] Setting up Swagger...');
    const config = new DocumentBuilder()
      .setTitle('API Gateway')
      .setDescription("Documentation de l'API")
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    console.log('🔧 [5/5] Starting server...');
    const port = Number(process.env.PORT) || 4000;
    await app.listen(port, '0.0.0.0');

    console.log(`✅ Server started successfully!`);
    console.log(`🚀 API: http://0.0.0.0:${port}`);
    console.log(`📚 Docs: http://0.0.0.0:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Bootstrap failed at step:', error);
    throw error;
  }
}

bootstrap().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
