import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@app/contracts/authentication/guards/jwt-auth.guard';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}
}
