import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EXPENSES } from '@app/contracts/expenses/expenses.client';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(EXPENSES) private readonly expensesClient: ClientProxy,
  ) {}
}
