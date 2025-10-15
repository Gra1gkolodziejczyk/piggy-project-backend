import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EXPENSES_PATTERNS } from '@app/contracts/expenses/expenses.pattern';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject('EXPENSES_SERVICE') private readonly expensesClient: ClientProxy,
  ) {}
}
