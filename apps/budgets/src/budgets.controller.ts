import { Controller, Get } from '@nestjs/common';
import { BudgetsService } from './budgets.service';

@Controller()
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  getHello(): string {
    return this.budgetsService.getHello();
  }
}
