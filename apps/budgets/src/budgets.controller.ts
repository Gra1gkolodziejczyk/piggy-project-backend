import { Controller } from '@nestjs/common';
import { BudgetsService } from './budgets.service';

@Controller()
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}
}
