import { Controller } from '@nestjs/common';
import { IncomesService } from './incomes.service';

@Controller()
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}
}
