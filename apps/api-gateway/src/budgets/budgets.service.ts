import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BUDGETS_PATTERNS } from '@app/contracts/budgets/budgets.pattern';

@Injectable()
export class BudgetsService {
  constructor(
    @Inject('BUDGETS_SERVICE') private readonly budgetsClient: ClientProxy,
  ) {}
}
