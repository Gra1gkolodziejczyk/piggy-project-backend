import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { INCOMES_PATTERNS } from '@app/contracts/incomes/incomes.pattern';
import { CreateIncomeDto } from '@app/contracts/incomes/dto/create-income.dto';
import { UpdateIncomeDto } from '@app/contracts/incomes/dto/update-income.dto';

@Injectable()
export class IncomesService {
  constructor(
    @Inject('INCOMES_SERVICE') private readonly incomesClient: ClientProxy,
  ) {}

  create(userId: string, dto: CreateIncomeDto): Observable<any> {
    return this.incomesClient.send(INCOMES_PATTERNS.CREATE, {
      userId,
      dto,
    });
  }

  findAll(userId: string): Observable<any> {
    return this.incomesClient.send(INCOMES_PATTERNS.FIND_ALL, userId);
  }

  findOne(userId: string, incomeId: string): Observable<any> {
    return this.incomesClient.send(INCOMES_PATTERNS.FIND_ONE, {
      userId,
      incomeId,
    });
  }

  update(
    userId: string,
    incomeId: string,
    dto: UpdateIncomeDto,
  ): Observable<any> {
    return this.incomesClient.send(INCOMES_PATTERNS.UPDATE, {
      userId,
      incomeId,
      dto,
    });
  }

  delete(userId: string, incomeId: string): Observable<any> {
    return this.incomesClient.send(INCOMES_PATTERNS.DELETE, {
      userId,
      incomeId,
    });
  }

  /**
   * Supprimer définitivement un revenu (hard delete)
   */
  hardDelete(userId: string, incomeId: string): Observable<any> {
    return this.incomesClient.send(INCOMES_PATTERNS.HARD_DELETE, {
      userId,
      incomeId,
    });
  }
}
