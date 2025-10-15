import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@app/contracts/drizzle/drizzle.module';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DrizzleModule,
  ],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BanksModule {}
