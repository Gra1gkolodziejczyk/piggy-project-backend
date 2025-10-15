import { NestFactory } from '@nestjs/core';
import { ExpensesModule } from './expenses.module';

async function bootstrap() {
  const app = await NestFactory.create(ExpensesModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
