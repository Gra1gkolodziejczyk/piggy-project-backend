import { NestFactory } from '@nestjs/core';
import { BudgetsModule } from './budgets.module';

async function bootstrap() {
  const app = await NestFactory.create(BudgetsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
