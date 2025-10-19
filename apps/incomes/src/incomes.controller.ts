import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IncomesService } from './incomes.service';
import { INCOMES_PATTERNS } from '@app/contracts/incomes/incomes.pattern';
import { CreateIncomeDto } from '@app/contracts/incomes/dto/create-income.dto';
import { UpdateIncomeDto } from '@app/contracts/incomes/dto/update-income.dto';

@Controller()
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @MessagePattern(INCOMES_PATTERNS.CREATE)
  create(@Payload() payload: { userId: string; dto: CreateIncomeDto }) {
    return this.incomesService.create(payload.userId, payload.dto);
  }

  @MessagePattern(INCOMES_PATTERNS.FIND_ALL)
  findAll(@Payload() userId: string) {
    return this.incomesService.findAll(userId);
  }

  @MessagePattern(INCOMES_PATTERNS.FIND_ONE)
  findOne(@Payload() payload: { userId: string; incomeId: string }) {
    return this.incomesService.findOne(payload.userId, payload.incomeId);
  }

  @MessagePattern(INCOMES_PATTERNS.UPDATE)
  update(
    @Payload()
    payload: {
      userId: string;
      incomeId: string;
      dto: UpdateIncomeDto;
    },
  ) {
    return this.incomesService.update(
      payload.userId,
      payload.incomeId,
      payload.dto,
    );
  }

  @MessagePattern(INCOMES_PATTERNS.DELETE)
  delete(@Payload() payload: { userId: string; incomeId: string }) {
    return this.incomesService.delete(payload.userId, payload.incomeId);
  }

  @MessagePattern(INCOMES_PATTERNS.HARD_DELETE)
  hardDelete(@Payload() payload: { userId: string; incomeId: string }) {
    return this.incomesService.hardDelete(payload.userId, payload.incomeId);
  }
}
