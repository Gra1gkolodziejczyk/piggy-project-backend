import { NestFactory } from '@nestjs/core';
import { IncomesModule } from './incomes.module';

async function bootstrap() {
  const app = await NestFactory.create(IncomesModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
