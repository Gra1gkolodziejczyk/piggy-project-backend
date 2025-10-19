import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BUDGETS } from '@app/contracts/budgets/budgets.client';

@Injectable()
export class BudgetsService {
  constructor(
    @Inject(BUDGETS) private readonly budgetsClient: ClientProxy,
  ) {}
}
