import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

@Module({
  imports: [],
  controllers: [BudgetsController],
  providers: [BudgetsService],
})
export class BudgetsModule {}
