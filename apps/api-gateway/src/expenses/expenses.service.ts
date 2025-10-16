import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject('EXPENSES_SERVICE') private readonly expensesClient: ClientProxy,
  ) {}
}
