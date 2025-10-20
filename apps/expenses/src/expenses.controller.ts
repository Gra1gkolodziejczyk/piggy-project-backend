import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ExpensesService } from './expenses.service';
import { EXPENSES_PATTERNS } from '@app/contracts/expenses/expenses.pattern';
import { ExpenseResponseDto, CreateExpenseDto, UpdateExpenseDto } from '@app/contracts/expenses/dto';

@Controller()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @MessagePattern(EXPENSES_PATTERNS.CREATE)
  create(
    @Payload() payload: { userId: string; dto: CreateExpenseDto }
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.create(payload.userId, payload.dto);
  }

  @MessagePattern(EXPENSES_PATTERNS.FIND_ALL)
  findAll(@Payload() userId: string) {
    return this.expensesService.findAll(userId);
  }

  @MessagePattern(EXPENSES_PATTERNS.FIND_ONE)
  findOne(
    @Payload() payload: { userId: string; expenseId: string }
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.findOne(payload.userId, payload.expenseId);
  }

  @MessagePattern(EXPENSES_PATTERNS.UPDATE)
  update(
    @Payload() payload: { userId: string; expenseId: string; dto: UpdateExpenseDto }
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(
      payload.userId,
      payload.expenseId,
      payload.dto,
    );
  }

  @MessagePattern(EXPENSES_PATTERNS.DELETE)
  delete(
    @Payload() payload: { userId: string; expenseId: string }
  ): Promise<{ success: boolean; message: string }> {
    return this.expensesService.delete(payload.userId, payload.expenseId);
  }
}
