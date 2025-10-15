import { Controller, Get } from '@nestjs/common';
import { ExpensesService } from './expenses.service';

@Controller()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  getHello(): string {
    return this.expensesService.getHello();
  }
}
