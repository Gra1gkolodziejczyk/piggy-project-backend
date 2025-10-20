import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { EXPENSES } from '@app/contracts/expenses/expenses.client';
import { EXPENSES_PATTERNS } from '@app/contracts/expenses/expenses.pattern';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseResponseDto,
  ExpenseListResponseDto,
  FindAllExpensesQueryDto,
} from '@app/contracts/expenses/dto';

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(EXPENSES) private readonly expensesClient: ClientProxy,
  ) {}


  findAll(userId: string): Observable<ExpenseResponseDto[]> {
    return this.expensesClient.send<ExpenseResponseDto[]>(
      EXPENSES_PATTERNS.FIND_ALL,
      userId,
    );
  }


  findOne(userId: string, expenseId: string): Observable<ExpenseResponseDto> {
    return this.expensesClient.send<ExpenseResponseDto>(
      EXPENSES_PATTERNS.FIND_ONE,
      {
        userId,
        expenseId,
      },
    );
  }

  create(
    userId: string,
    createExpenseDto: CreateExpenseDto,
  ): Observable<ExpenseResponseDto> {
    return this.expensesClient.send<ExpenseResponseDto>(
      EXPENSES_PATTERNS.CREATE,
      {
        userId,
        ...createExpenseDto,
      },
    );
  }

  update(
    userId: string,
    expenseId: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Observable<ExpenseResponseDto> {
    return this.expensesClient.send<ExpenseResponseDto>(
      EXPENSES_PATTERNS.UPDATE,
      {
        userId,
        expenseId,
        ...updateExpenseDto,
      },
    );
  }

  remove(userId: string, expenseId: string): Observable<void> {
    return this.expensesClient.send<void>(EXPENSES_PATTERNS.DELETE, {
      userId,
      expenseId,
    });
  }

  getStatistics(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Observable<any> {
    return this.expensesClient.send(EXPENSES_PATTERNS.GET_STATISTICS, {
      userId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }
}
