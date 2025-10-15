import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { INCOMES_PATTERNS } from '@app/contracts/incomes/incomes.pattern';

@Injectable()
export class IncomesService {
  constructor(
    @Inject('INCOMES_SERVICE') private readonly incomesClient: ClientProxy,
  ) {}
}
